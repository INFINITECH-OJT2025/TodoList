<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
// use App\Models\Notification;
// use App\Events\NotificationSent;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    // POGI SI Ariel James De Guzman
    // private function sendNotification($message, $userId)
    // {

    //     $notification = Notification::create([
    //         'user_id' => $userId,
    //         'message' => $message,
    //         'status' => 'unread',
    //     ]);

    //     // Broadcast the event
    //     broadcast(new NotificationSent($notification))->toOthers();
    // }
    public function getUsers()
    {
        // Filter users by usertype 'admin'
        $adminUsers = User::where('usertype', 'user')->get();
        
        return response()->json($adminUsers);
    }

    public function getAdmins()
    {
        // Filter users by usertype 'admin'
        $adminUsers = User::where('usertype', 'admin')->get();
        
        return response()->json($adminUsers);
    }
    

    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function register(Request $request)
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8', // Ensure 'password_confirmation' field matches
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validate image upload
        ]);
    
        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        // Handle file upload for profile image
        $imagePath = null;
        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            
            // Generate a unique filename to avoid conflicts
            $imageName = time() . '_' . $image->getClientOriginalName();
            
            // Move the file to the public directory (public/profile_images)
            $imagePath = 'profile_images/' . $imageName;
            $image->move(public_path('profile_images'), $imageName);
        }
    
        // Create the user
        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_image' => $imagePath, // Save the relative public path of the image
            'usertype' => 'user', // Default user type
        ]);
    
        // Generate token
        $token = $user->createToken('authToken')->plainTextToken;
    
        // Return response with the token and user data
        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function Adminregister(Request $request)
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed', // Ensuring password confirmation
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validate image upload
        ]);
        
        

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Handle file upload for profile image
            $imagePath = null;
            if ($request->hasFile('profile_image')) {
                $image = $request->file('profile_image');
                
                // Generate a unique filename
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                
                // Move the file to the public directory (public/profile_images)
                $imagePath = 'profile_images/' . $imageName;
                $image->move(public_path('profile_images'), $imageName);
            }

            // Create the admin user
            $user = User::create([
                'username' => trim($request->username),
                'email' => trim($request->email),
                'password' => Hash::make($request->password),
                'profile_image' => $imagePath, // Save the relative public path of the image
                'usertype' => 'admin', // Default user type
            ]);

            // Generate token
            $token = $user->createToken('authToken')->plainTextToken;

            // Return response with the token and user data
            return response()->json([
                'message' => 'Admin registered successfully!',
                'user' => $user,
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong. Please try again.'], 500);
        }
    }

    

    public function login(Request $request)
    {
        // Validate incoming request
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        // Retrieve the user based on the username
        $user = User::where('username', $request->username)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Generate the authToken
        $token = $user->createToken('authToken')->plainTextToken;

        // Update the user's authToken in the database
        $user->authToken = $token;  // Assuming you have an 'authToken' column in the users table
        $user->save();

        // Return the response with the user details and generated token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'usertype' => $user->usertype
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        // Find the user by ID
        $user = User::findOrFail($id);
        
        // Validation rules
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:10240', // optional

        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Handle profile image update
        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imagePath = $image->store('profile_images', 'public');
            $user->profile_image = $imagePath;
        }

        // Update user information
        $user->update($request->only(['username', 'email', 'profile_image']));

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function deleteUser($id)
    {
        // Delete the user
        User::destroy($id);
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            $user->tokens()->delete(); // Delete all user tokens
        }

        return response()->json(['message' => 'Logged out'], 200);
    }

    public function show()
    {
        var_dump("Hello");
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
    
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'profile_image' => 'nullable|image|max:2048'
        ]);
    
        if ($request->hasFile('profile_image')) {
            // Store image in public/profile_images folder
            $image = $request->file('profile_image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('profile_images'), $imageName);
    
            // Save the public path (e.g., profile_images/image.jpg)
            $user->profile_image = 'profile_images/' . $imageName;
        }
    
        $user->username = $request->username;
        $user->email = $request->email;
        $user->save();
    
        // Send notification after profile update
       
    
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
    
    

    public function getUserByToken(Request $request)
    {
        $authToken = $request->bearerToken(); // Get token from Authorization header

        if (!$authToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Find user by token
        $user = User::where('authToken', $authToken)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return response()->json(['user' => $user]);
    }

    public function deleteAdmin($id)
    {
        // Find the admin by ID
        $admin = User::find($id);

        // Check if the admin exists
        if (!$admin) {
            return response()->json(['message' => 'Admin not found'], 404);
        }

        // Delete the admin
        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully'], 200);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'username' => 'string|min:6',
            'email' => 'email',
        ]);

        $usernameAvailable = !User ::where('username', $request->username)->exists();
        $emailAvailable = !User ::where('email', $request->email)->exists();

        return response()->json([
            'usernameAvailable' => $usernameAvailable,
            'emailAvailable' => $emailAvailable,
        ]);
    }

}
