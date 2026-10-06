# FlowOps

Mobile-first work order and workflow management platform.

FlowOps is a full-stack application designed to manage operational work orders from creation to completion.

## Stack

### Mobile

- React Native
- Expo
- TypeScript

### Backend

- NestJS
- TypeScript

### Data

- Supabase
- PostgreSQL

### Testing

- Vitest
- API E2E testing

## Core workflow

NEW
↓
ASSIGNED
↓
IN_PROGRESS
↕
BLOCKED
↓
COMPLETED

## Roles

- ADMIN
- OPERATOR

## Project structure

apps/api

NestJS backend.

apps/mobile

React Native application.

packages/shared

Shared domain definitions.

docs

Architecture and business workflow documentation.

## Status

🚧 MVP under development.