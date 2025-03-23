<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Notification;


class ActivityController extends Controller
{




    private function sendNotification($message, $userId)
    {

        $notification = Notification::create([
            'user_id' => $userId,
            'message' => $message,
            'status' => 'unread',
        ]);

        // Broadcast the event
        broadcast(new NotificationSent($notification))->toOthers();
    }
    // Fetch all activities (including filtering by status)
    public function index(Request $request, $authToken)
    {
        // Get token from request header
        // $authToken = $request->header('Authorization');
    
        // if (!$authToken) {
        //     return response()->json(['message' => 'Unauthorized'], 401);
        // }
    
        // Find user by the token in the User model
        $user = User::where('authToken', $authToken)->first();
    
        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }
    
        // Fetch activities belonging to the authenticated user
        $query = Activity::where('user_id', $user->id)->orWhere('collaborator', $user->id);
    
        // Optional: Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->get();
        foreach ($records as $record) {
            $record['collaborator_name'] = User::find($record->collaborator)->username;
        }
        
        return response()->json($records, 200);
    }

    public function getUserByToken($authToken)
    {
        $user = User::where('authToken', $authToken)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return response()->json(['id' => $user->id], 200);
    }

    // Store a new activity
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_started' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date_started',
            'tags' => 'nullable|string',
            'status' => 'required|in:pending,complete,overdue',
            'archive' => 'boolean',
            'user_id' => 'required|exists:users,id' ,// Ensure the user exists
             'collaborators' => 'required|exists:users,id'

        ]);

        $validated = $validator->validated();
        $validated['collaborator'] = $validated['collaborators'][0];
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $activity = Activity::create($validated);
        return response()->json($activity, 201);
    }
    


    // Show a single activity
    public function show($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            return response()->json($activity, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activity not found'], 404);
        }
    }

    // Update an existing activity
    public function update(Request $request, $id)
    {
        try {
            $activity = Activity::findOrFail($id);
    
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'date_started' => 'sometimes|required|date',
                'due_date' => 'sometimes|required|date|after_or_equal:date_started',
                'tags' => 'nullable|string',
                'status' => 'sometimes|required|in:pending,complete,overdue',
                'archive' => 'boolean',
                'user_id' => 'required|exists:users,id',// Ensure user exists
                // 'collaborator' => 'required|exists:users,id'
            ]);
    
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
    
            $activity->update($request->all());
            return response()->json($activity, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activity not found or failed to update'], 500);
        }
    }
    

    // Delete an activity
    public function destroy($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->delete();
            return response()->json(['message' => 'Activity deleted'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activity not found or failed to delete'], 500);
        }
    }

    // Archive an activity
    public function archiveActivity($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->archive = 1; // Set archive to 1
            $activity->save();
    
            return response()->json(['message' => 'Activity archived successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error archiving activity', 'message' => $e->getMessage()], 500);
        }
    }
    
    

    // Unarchive an activity
    public function unarchive($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->update(['archive' => false]);
            return response()->json(['message' => 'Activity unarchived successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activity not found or failed to unarchive'], 500);
        }
    }

    public function markAsDone($id)
{
    try {
        $activity = Activity::findOrFail($id);
        $activity->status = 'complete';
        $activity->save();
        $this->sendNotification('Your personal task is done with your collaborator '. $activity->user_id . ' Deadline: '. $activity->due_date . ' Status: '. $activity->status . '', $activity->user_id, $activity->description );

        return response()->json(['message' => 'Activity marked as done successfully'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error marking activity as done', 'message' => $e->getMessage()], 500);
        
    }

    
}

public function restore($id)
{
    $activity = Activity::where('id', $id)->where('archive', 1)->first();

    if (!$activity) {
        return response()->json(['message' => 'Activity not found or not archived'], 404);
    }

    $activity->update(['archive' => 0]);

    return response()->json(['message' => 'Activity restored successfully', 'activity' => $activity], 200);


}

public function markAsOverdue (Request $request, $id)
{
    // Find the activity by ID
    $activity = Activity::find($id);

    if (!$activity) {
        return response()->json(['message' => 'Activity not found'], 404);
    }

    // Update the status to 'overdue'
    $activity->status = 'overdue';
    $activity->save();

    $this->sendNotification('Your personal task is going to overdue '. $activity->user_id . ' Deadline: '. $activity->due_date . ' Status: '. $activity->status . '', $activity->user_id, $activity->description );
    return response()->json($activity, 201); // Return the created task with a 201 status code

    return response()->json(['message' => 'Activity marked as overdue', 'activity' => $activity], 200);
}
}
