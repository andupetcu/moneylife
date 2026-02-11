import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { AppError } from '../middleware/error-handler';
import { requireRole } from '../middleware/auth';

const createClassroomSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.object({
    persona: z.string().optional(),
    difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
    levelRange: z.object({ min: z.number().min(1), max: z.number().max(8) }).optional(),
  }).optional(),
});

const joinClassroomSchema = z.object({
  joinCode: z.string().min(4).max(20),
});

const createAssignmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  type: z.enum(['complete_level', 'budget_adherence', 'savings_goal', 'custom']),
  target: z.number().optional(),
});

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createClassroom(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== 'teacher' && req.user!.role !== 'system_admin') {
    throw new AppError(403, 'Only teachers can create classrooms');
  }
  const body = createClassroomSchema.parse(req.body);
  const classroom = {
    id: uuid(),
    teacherId: req.user!.sub,
    partnerId: req.user!.partnerId || null,
    name: body.name,
    joinCode: generateJoinCode(),
    config: body.config || {},
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json(classroom);
}

export async function getClassroom(req: Request, res: Response): Promise<void> {
  const classroomId = req.params.id;
  // Stub: query classrooms table with partner_id filtering
  res.json({ id: classroomId, members: [], assignments: [] });
}

export async function joinClassroom(req: Request, res: Response): Promise<void> {
  const classroomId = req.params.id;
  const body = joinClassroomSchema.parse(req.body);
  // Stub: verify join code matches, add member
  res.status(201).json({
    classroomId,
    userId: req.user!.sub,
    joinedAt: new Date().toISOString(),
    status: 'active',
  });
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== 'teacher' && req.user!.role !== 'system_admin') {
    throw new AppError(403, 'Only teachers can create assignments');
  }
  const classroomId = req.params.id;
  const body = createAssignmentSchema.parse(req.body);
  res.status(201).json({
    id: uuid(),
    classroomId,
    ...body,
    createdBy: req.user!.sub,
    createdAt: new Date().toISOString(),
  });
}

export async function getAssignments(req: Request, res: Response): Promise<void> {
  const classroomId = req.params.id;
  // Stub: query assignments for this classroom
  res.json({ classroomId, assignments: [] });
}

export async function getStudentProgress(req: Request, res: Response): Promise<void> {
  const classroomId = req.params.id;
  // Stub: aggregate student progress data
  res.json({ classroomId, students: [] });
}
