import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { Worker, Job, QUEUE_NAMES, TranscriptionJobData, getRedisConnection } from '@captionstudio/queue';
import { prisma, Prisma, JobStatus, ProjectStatus } from '@captionstudio/database';
import { createStorageProvider } from '@captionstudio/storage';
import { FFmpegService, AudioExtractorService } from '@captionstudio/media';
import { WhisperEngine } from '../services/stt/whisper.engine';

const connection = getRedisConnection();
const storage = createStorageProvider();
const ffmpegService = new FFmpegService();
const audioExtractor = new AudioExtractorService(ffmpegService);
const whisperEngine = new WhisperEngine();

async function updateJobState(
  jobId: string,
  data: {
    status?: JobStatus;
    progress?: number;
    stage?: string;
    errorMessage?: string | null;
    metadata?: Prisma.InputJsonValue;
    completedAt?: Date;
    startedAt?: Date;
  }
) {
  try {
    await prisma.exportJob.update({
      where: { id: jobId },
      data,
    });
  } catch (err) {
    console.error(`[Transcription Worker] Failed to update DB state for job ${jobId}:`, err);
  }
}

export function createTranscriptionWorker() {
  return new Worker<TranscriptionJobData>(
    QUEUE_NAMES.TRANSCRIPTION,
    async (job: Job<TranscriptionJobData>) => {
      const { jobId, projectId, userId, workspaceId, audioStorageKey, language, whisperModel } = job.data;
      console.log(`[Transcription Worker] Processing job ${job.id} for project ${projectId}`);

      // Check if job was already completed or cancelled before starting
      const existingJob = await prisma.exportJob.findUnique({ where: { id: jobId } });
      if (existingJob?.status === JobStatus.COMPLETED) {
        console.log(`[Transcription Worker] Job ${jobId} was already completed. Skipping.`);
        return { alreadyCompleted: true };
      }
      if (existingJob?.status === JobStatus.CANCELLED) {
        console.log(`[Transcription Worker] Job ${jobId} was cancelled. Aborting.`);
        return { cancelled: true };
      }

      await updateJobState(jobId, {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        progress: 10,
        stage: 'Preparing media',
      });
      await job.updateProgress(10);

      let tempVideoPath: string | null = null;
      let tempAudioPath: string | null = null;

      try {
        // 1. Obtain media file from storage
        await updateJobState(jobId, { progress: 15, stage: 'Retrieving media for transcription' });
        await job.updateProgress(15);

        let sourcePath: string;
        const tempResult = await storage.downloadToTempFile(audioStorageKey);
        sourcePath = tempResult.filePath;
        tempVideoPath = tempResult.filePath;

        // 2. Extract 16kHz mono audio stream
        await updateJobState(jobId, { progress: 25, stage: 'Extracting audio' });
        await job.updateProgress(25);

        tempAudioPath = path.join(os.tmpdir(), `stt-audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.wav`);
        await audioExtractor.extractWhisperAudio(sourcePath, tempAudioPath);

        // 3. Load Speech Model
        await updateJobState(jobId, { progress: 35, stage: 'Loading speech model' });
        await job.updateProgress(35);

        // 4. Run real Whisper transcription
        await updateJobState(jobId, { progress: 50, stage: 'Transcribing speech to text' });
        await job.updateProgress(50);

        const sttResult = await whisperEngine.transcribe(tempAudioPath, {
          model: whisperModel || process.env.WHISPER_MODEL || 'tiny',
          language: language || 'auto',
          wordTimestamps: true,
        });

        // 5. Check cancellation after transcription
        const recheckJob = await prisma.exportJob.findUnique({ where: { id: jobId } });
        if (recheckJob?.status === JobStatus.CANCELLED) {
          console.log(`[Transcription Worker] Job ${jobId} was cancelled during processing. Halting.`);
          return { cancelled: true };
        }

        // 6. Normalize into standard CaptionLine & CaptionWord models
        await updateJobState(jobId, { progress: 85, stage: 'Normalizing word timestamps' });
        await job.updateProgress(85);

        const captionLines = sttResult.segments.map((seg, idx) => ({
          id: `line_${idx + 1}`,
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
          words: seg.words.map((w) => ({
            id: w.id,
            text: w.text,
            startTime: w.start,
            endTime: w.end,
            confidence: w.confidence,
          })),
        }));

        const captionPayload = {
          lines: captionLines,
          language: sttResult.language,
          duration: sttResult.duration,
          fullText: sttResult.text,
        };

        // 7. Save to Database: ProjectVersion and UsageLedger
        await updateJobState(jobId, { progress: 95, stage: 'Saving captions' });
        await job.updateProgress(95);

        const latestVersion = await prisma.projectVersion.findFirst({
          where: { projectId },
          orderBy: { versionNumber: 'desc' },
        });

        const nextVersionNum = (latestVersion?.versionNumber || 0) + 1;
        const durationMinutes = Math.max(0.1, Math.ceil((sttResult.duration / 60) * 10) / 10);

        await prisma.$transaction(async (tx) => {
          await tx.projectVersion.create({
            data: {
              projectId,
              versionNumber: nextVersionNum,
              captionPayload: captionPayload as unknown as Prisma.InputJsonValue,
              changelog: `AI Transcription generated via Whisper (${sttResult.language.toUpperCase()})`,
            },
          });

          await tx.project.update({
            where: { id: projectId },
            data: {
              status: ProjectStatus.READY,
              durationSeconds: sttResult.duration,
            },
          });

          // Record usage idempotently with eventKey
          const eventKey = `TRANSCRIPTION:${jobId}`;
          const existingLedger = await tx.usageLedger.findUnique({
            where: { eventKey },
          });

          if (!existingLedger) {
            await tx.usageLedger.create({
              data: {
                userId,
                workspaceId,
                type: 'TRANSCRIPTION_MINUTES',
                amount: durationMinutes,
                projectId,
                jobId,
                eventKey,
              },
            });
          }
        });

        // 8. Mark Job Completed
        await updateJobState(jobId, {
          status: JobStatus.COMPLETED,
          progress: 100,
          stage: 'Transcription complete',
          completedAt: new Date(),
          metadata: {
            language: sttResult.language,
            durationSeconds: sttResult.duration,
            segmentsCount: sttResult.segments.length,
            versionNumber: nextVersionNum,
          },
        });
        await job.updateProgress(100);

        console.log(
          `[Transcription Worker] Successfully transcribed project ${projectId}: ${sttResult.segments.length} segments, ${sttResult.duration}s in ${sttResult.language}`
        );

        return {
          success: true,
          language: sttResult.language,
          segmentsCount: sttResult.segments.length,
          versionNumber: nextVersionNum,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown transcription error';
        console.error(`[Transcription Worker] Error on job ${jobId}:`, message);

        await updateJobState(jobId, {
          status: JobStatus.FAILED,
          errorMessage: "We couldn't transcribe this video. Please verify audio clarity and retry.",
          metadata: {
            errorCode: 'TRANSCRIPTION_FAILED',
            errorDetails: message,
            failedAt: new Date().toISOString(),
          },
        });

        await prisma.project.update({
          where: { id: projectId },
          data: { status: ProjectStatus.READY },
        }).catch(() => {});

        throw err;
      } finally {
        if (tempVideoPath && fs.existsSync(tempVideoPath)) {
          await fs.promises.unlink(tempVideoPath).catch(() => {});
        }
        if (tempAudioPath && fs.existsSync(tempAudioPath)) {
          await fs.promises.unlink(tempAudioPath).catch(() => {});
        }
      }
    },
    { connection, concurrency: 1 }
  );
}

