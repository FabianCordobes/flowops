# FlowOps Architecture

## Overview

FlowOps is a mobile-first work order and workflow management platform.

## Applications

### Mobile

React Native + Expo + TypeScript

Responsibilities:

- Authentication
- Dashboard
- Work order list
- Work order detail
- Work order creation
- Status transitions
- Comments
- Work order history

### API

NestJS + TypeScript

Responsibilities:

- Authentication validation
- Authorization
- Business rules
- Workflow validation
- Work order management
- Event history
- Comments
- Dashboard aggregation

## Database

Supabase PostgreSQL

Main entities:

- profiles
- work_orders
- work_order_events
- comments

## Authentication

Supabase Auth

The mobile application authenticates through Supabase.

NestJS validates the authenticated user and applies authorization and business rules.

## Principle

Business rules belong to the API.

The mobile application must never be trusted to enforce permissions or workflow transitions.