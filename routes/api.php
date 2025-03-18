<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\AdminProjectController;
use App\Http\Controllers\MyToDoListController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\NotificationController;

use App\Http\Controllers\ProgressController;
use Illuminate\Support\Facades\Broadcast;
use Pusher\Pusher;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['web'])->group(function () {
    Route::get('/csrf-cookie', function () {
        return response()->json(['csrf_token' => csrf_token()]);
    });
});
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// login / register
Route::post('/register', [AuthController::class, 'register']);
Route::post('/Adminregister', [AuthController::class, 'Adminregister']);
Route::get('/show', [AuthController::class, 'show']);

Route::get('/users', [AuthController::class, 'index']);

Route::get('/users', [AuthController::class, 'getUsers']);
Route::get('/admins', [AuthController::class, 'getAdmins']);


Route::delete('admins/{id}', [AuthController::class, 'deleteAdmin']);

Route::get('/users', [AuthController::class, 'getUsers']);
Route::put('/users/{id}', [AuthController::class, 'updateUser']);
Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
Route::post('/check-availability', [AuthController::class, 'checkAvailability']);




// Crud routes




Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

Route::get('/user', [AuthController::class, 'getUserByToken']);

Route::middleware('auth:sanctum')->post('/update-profile', [AuthController::class, 'updateProfile']);




// adminproject


Route::get('tasks', [AdminProjectController::class, 'index']);
Route::get('notArchive', [AdminProjectController::class, 'notArchive']);
Route::get('tasks/{id}', [AdminProjectController::class, 'show']);
Route::post('tasks', [AdminProjectController::class, 'store']);
Route::put('tasks/{id}', [AdminProjectController::class, 'update']);
Route::delete('tasks/{id}', [AdminProjectController::class, 'destroy']);
Route::post('/getUserId', [AdminProjectController::class, 'getUserId']);
Route::patch('tasks/{taskId}/markAsDone', [AdminProjectController::class, 'markAsDone']);


Route::delete('tasks/{taskId}', [AdminProjectController::class, 'deleteTask']);
Route::put('/tasks/{id}/archive', [AdminProjectController::class, 'archiveTask']);
Route::patch('/tasks/{id}/updateStatus', [AdminProjectController::class, 'updateStatus']);


Route::get('tasks/{taskId}/edit', [AdminProjectController::class, 'editTask']);
Route::put('tasks/{taskId}', [AdminProjectController::class, 'updateTask']);

Route::put('/tasks/{id}/restore', [AdminProjectController::class, 'restoreTask']);
Route::delete('/tasks/{id}', [AdminProjectController::class, 'deleteTasks']);

// Route::get('/tasks/archived', [AdminProjectController::class, 'archivedTasks']);
Route::get('/archived-tasks', [AdminProjectController::class, 'getArchivedTasks']); 
Route::put('/tasks/restore/{id}', [AdminProjectController::class, 'restore']);
Route::put('/tasks/{id}/toggle-visibility', [AdminProjectController::class, 'toggleVisibility']);

// Acitvity



// Route::put('activity/{activity}/archive', [ActivityController::class, 'archive']);

Route::get('/activities/{authToken}', [ActivityController::class, 'index']);
Route::apiResource('/activities', ActivityController::class);
Route::get('/user/{authToken}', [ActivityController::class, 'getUserByToken']);

Route::put('/activities/{id}/archive', [ActivityController::class, 'archive']);
Route::put('/activities/{id}/done', [ActivityController::class, 'markAsDone']);

Route::put('/activities/{id}/archive', [ActivityController::class, 'archiveActivity']);

Route::get('/activities/{activityId}/checklists', [ActivityController::class, 'getChecklistItems']);
Route::post('/activities/{activityId}/checklists', [ActivityController::class, 'storeChecklistItem']);
Route::put('/activities/{activityId}/checklists/{checklistItemId}', [ActivityController::class, 'updateChecklistItem']);
Route::delete('/activities/{activityId}/checklists/{checklistItemId}', [ActivityController::class, 'destroyChecklistItem']);
Route::put('/activities/{id}/restore/', [ActivityController::class, 'restore']);
Route::put('/activities/{id}/overdue', [ActivityController::class, 'markAsOverdue']);


// NOTIFICATION

Route::get('/notifications', [NotificationController::class, 'getUserNotifications']);
Route::put('/notifications/{id}/markAsRead', [NotificationController::class, 'markAsRead']);
Route::put('/notifications/markAllAsRead', [NotificationController::class, 'markAllAsRead']);




//progress


Route::get('/progress', [ProgressController::class, 'index']);
Route::post('/progress', [ProgressController::class, 'store']);
Route::put('/progress/{progress}', [ProgressController::class, 'update']);
Route::delete('/progress/{progress}', [ProgressController::class, 'destroy']);




// Route::middleware('role')->group(function () {
//     Route::get('/admin/dashboard', [AuthController::class, 'index']);
// });

// Route::middleware('role')->group(function () {
//     Route::get('/user/dashboard', [AuthController::class, 'index']);
// });


Route::get('/pusher-test', function () {
    try {
        $pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            ['cluster' => config('broadcasting.connections.pusher.options.cluster'), 'useTLS' => true]
        );

        $pusher->trigger('notifications', 'test-event', ['message' => 'Pusher is working!']);

        return response()->json(['status' => 'success', 'message' => 'Pusher is connected!']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});