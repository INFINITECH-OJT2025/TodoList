<?php

namespace App\Http\Controllers;

use App\Models\Task; // Make sure to import the Task model
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Notification;

class AdminProjectController extends Controller
{



    private function sendNotification($message, $userId)
    {

        $notification = Notification::create([
            'user_id' => $userId,
            'message' => $message,
            'status' => 'unread',
        ]);

        // Broadcast the event
        // broadcast(new NotificationSent($notification))->toOthers();
    }
    // Show a list of tasks
    public function index()
    {
        $tasks = Task::all(); // Retrieves all tasks from the database
        return response()->json($tasks); // Return tasks as a JSON response
    }

    public function notArchive()
    {
        $tasks = Task::where('archived', 0)->get(); // Retrieves all tasks where archived = 0
        return response()->json($tasks); // Return tasks as a JSON response
    }
    


    // Show a specific task
    public function show($userId)
    {
        // Find tasks by user_id
        $tasks = Task::where('user_id', $userId)
                        ->where('visibility', 'visible')
                             ->get();
    
        // Check if tasks exist for the given user_id
    
        return response()->json($tasks); // Return the tasks as a JSON response
    }
    

    // Create a new task
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'time_started' => 'required|date',
            'time_ended' => 'required|date',
            'deadline' => 'required|date',
            'status' => 'required|string|in:pending,canceled,complete,overdue',
            'tags' => 'nullable|string',
        ]);

        $task = Task::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'description' => $request->description,
            'time_started' => $request->time_started,
            'time_ended' => $request->time_ended,
            'deadline' => $request->deadline,
            'status' => $request->status,
            'tags' => $request->tags,
        ]);
        // Send notification after profile update
        $this->sendNotification('An admin asigned a task for you '. $request->user_id . ' Deadline: '. $request->deadline . ' Status: '. $request->status . '', $request->user_id);
        return response()->json($task, 201); // Return the created task with a 201 status code
    }

    // Update an existing task
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id); // Find the task to update

        // Validate the incoming request
        $request->validate([
            'user_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'time_started' => 'required|date',
            'time_ended' => 'required|date',
            'deadline' => 'required|date',
            'status' => 'required|string|in:pending,canceled,complete,overdue',
            'tags' => 'nullable|string',
        ]);

        // Update the task with the new data
        $task->update([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'description' => $request->description,
            'time_started' => $request->time_started,
            'time_ended' => $request->time_ended,
            'deadline' => $request->deadline,
            'status' => $request->status,
            'tags' => $request->tags,
        ]);

        return response()->json($task); // Return the updated task
    }

    // Delete a task
    public function destroy($id)
    {
        $task = Task::findOrFail($id); // Find the task to delete
        $task->delete(); // Delete the task

        return response()->json(null, 204); // Return a successful response with no content
    }

    public function markAsDone($taskId)
    {
        $task = Task::find($taskId);
        
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }
    
        // Update the task status to 'complete'
        $task->status = 'complete';
        $task->save();
    
        return response()->json(['message' => 'Task marked as complete'], 200);
    }
    
   

    // Handle Task Form Submission for Updates
    public function updateTask(Request $request, $taskId)
    {
        try {
            $task = Task::findOrFail($taskId); // Find the task by ID

            // Validate the incoming request
            $validatedData = $request->validate([
                'user_id' => 'required|integer',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'time_started' => 'nullable|date',
                'time_ended' => 'nullable|date',
                'deadline' => 'nullable|date',
                'status' => 'nullable|string|in:pending,canceled,complete,overdue',
                'tags' => 'nullable|string', // Modify based on your data structure
            ]);

            // Update the task with the validated data
            $task->update($validatedData);
            return response()->json(['message' => 'Task updated successfully!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update task.'], 500);
        }
    }



    public function getUserId(Request $request)
    {
        $authToken = $request->input('authToken');
        
        // Find the user with the given authToken
        $user = User::where('authToken', $authToken)->first();

        if ($user) {
            // Return the user id if the token matches
            return response()->json([
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'profile_image' => $user->profile_image,
            ]);
        } else {
            return response()->json(['error' => 'Invalid authToken'], 401);
        }
    }
    public function deleteTasks($taskId)
    {
        try {
            $task = Task::findOrFail($taskId); // Find the task by ID
            $task->delete(); // Delete the task from the database
            return response()->json(['message' => 'Task deleted successfully!'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Task not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete task.', 'error' => $e->getMessage()], 500);
        }
    }
    // Function to handle Archive Task (status change to 'archived')
    public function archiveTask($id)
    {
        $task = Task::find($id);
        
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->archived = true;
        $task->save();

        return response()->json(['message' => 'Task archived successfully'], 200);
    }


        // Function to handle Edit Task (pre-fill the task data)
        public function editTask($taskId)
    {
        try {
            $task = Task::findOrFail($taskId);
            return response()->json($task, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Task not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch task details.', 'error' => $e->getMessage()], 500);
        }
    }

    public function archivedIndex()
    {
        $archivedTasks = Task::where('archived', 1)->get(); // Retrieve only archived tasks
        return response()->json($archivedTasks); // Return as JSON response
    }



    public function getArchivedTasks()
    {
        $archivedTasks = Task::where('archived', true)->get();
        return response()->json($archivedTasks);
    }


    public function restore($id)
    {
        $task = Task::where('id', $id)->first();

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        $task->archived = 0; // Ensure archived is set to 0
        $task->save(); // Save changes

        return response()->json([
            'message' => 'Task restored successfully.',
            'task' => $task
        ]);
    }



    public function toggleVisibility($id)
    {
        $task = Task::findOrFail($id);
        
        // Toggle the visibility
        $task->visibility = $task->visibility === 'visible' ? 'invisible' : 'visible';
        $task->save();

        return response()->json([
            'message' => 'Task visibility updated successfully',
            'task' => $task
        ]);
    }

    public function updateStatus(Request $request, $id)
{
    $task = Task::find($id);
    if (!$task) {
        return response()->json(['message' => 'Task not found'], 404);
    }

    $task->status = $request->status;
    $task->save();

    $this->sendNotification('Your Task from Admin: Overdue '. $task->user_id . ' Deadline: '.  $task->deadline . 'Title:'  . $task->title .  ' Status: '. $task->status . '', $task->user_id);
    return response()->json(['message' => 'Task status updated successfully']);
}



}
