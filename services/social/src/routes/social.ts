import { Router } from 'express';
import { wrap } from '../utils/wrap';
import * as friendsController from '../controllers/friends';
import * as leaderboardsController from '../controllers/leaderboards';
import * as classroomsController from '../controllers/classrooms';

const friends = Router();
friends.get('/', wrap(friendsController.getFriends));
friends.post('/', wrap(friendsController.addFriend));
friends.post('/request', wrap(friendsController.sendFriendRequest));
friends.put('/:requestId/accept', wrap(friendsController.acceptFriendRequest));
friends.put('/:requestId/reject', wrap(friendsController.rejectFriendRequest));
friends.delete('/:friendId', wrap(friendsController.removeFriend));

const leaderboards = Router();
leaderboards.get('/:type', wrap(leaderboardsController.getLeaderboard));

const classrooms = Router();
classrooms.post('/', wrap(classroomsController.createClassroom));
classrooms.get('/:id', wrap(classroomsController.getClassroom));
classrooms.post('/:id/join', wrap(classroomsController.joinClassroom));
classrooms.post('/:id/assignments', wrap(classroomsController.createAssignment));
classrooms.get('/:id/assignments', wrap(classroomsController.getAssignments));
classrooms.get('/:id/progress', wrap(classroomsController.getStudentProgress));

export const socialRouter = { friends, leaderboards, classrooms };
