<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(
            $request->string('name')->toString(),
            $request->string('email')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json([
            'message' => 'Usuário registrado com sucesso.',
            'token' => $result['token'],
            'refresh_token' => $result['refresh_token'],
            'user' => new UserResource($result['user']),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->string('email')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token' => $result['token'],
            'refresh_token' => $result['refresh_token'],
            'user' => new UserResource($result['user']),
        ]);
    }

    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $result = $this->authService->refresh(
            $request->string('refresh_token')->toString(),
        );

        return response()->json([
            'token' => $result['token'],
            'refresh_token' => $result['refresh_token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
