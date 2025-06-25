# Application Structure Template
```
src/
├── config/
├── constant/
├── handlers/
├── helpers/
├── middlewares/
├── modules/
├── tests/
├── types/
├── utils/
└── server.ts
```

# Module Documentation Template

## Module Structure Analysis

### Directory Structure

```
{moduleName}/
├── constant/
│   └── enum.ts                    # Module-specific enums and constants
├── controllers/
│   ├── {moduleName}.controller.ts     # HTTP request handlers
├── models/
│   └── {moduleName}.model.ts          # Mongoose schema and model
├── routes/
│   └── {moduleName}.route.ts          # Express route definitions
├── services/
│   ├── {moduleName}.service.ts        # Business logic layer
├── types/
│   └── {moduleName}.type.ts           # TypeScript interfaces
└── validators/
    ├── {moduleName}.validate.ts       # Zod validation schemas
```

## Example Structure

```user/
├── constant/
│   └── enum.ts
├── controllers/
│   ├── user.controller.ts
├── models/
│   └── user.model.ts
├── routes/
│   └── user.route.ts
├── services/
│   ├── user.service.ts
├── types/
│   └── user.type.ts
└── validators/
    ├── user.validate.ts
```

## Model Layer Structure and Patterns

### Model File Organization

The model file follows a consistent structure:

1. **Schema Definition** - Mongoose schema with proper typing
2. **Main Model Export** - Primary model for the module
3. **Helper Functions** - Database query utilities and validators

### Standard Model Template

```typescript
import mongoose, { Schema, Document } from "mongoose";

// Schema definition with TypeScript interface
const {moduleName}Schema: Schema<I{ModuleName}> = new Schema({
  // Define your schema fields here
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// Main model export
const {ModuleName}Model = mongoose.model<I{ModuleName}>("{ModuleName}", {moduleName}Schema);
```

## Key Features to Implement

### 1. Validation Layer (`validators/`)

- **Zod schemas** for input validation
- **Type inference** for TypeScript integration
- **Comprehensive validation tests** covering edge cases

### 2. Service Layer (`services/`)

- **Business logic** separated from controllers
- **Error handling** with custom AppError types
- **Database operations** with proper population
- **Comprehensive unit tests** with mocked dependencies

### 3. Controller Layer (`controllers/`)

- **HTTP request handling** using Express
- **Response standardization** using sendResponse helper
- **Error propagation** to middleware
- **Full test coverage** including error scenarios

### 4. Route Layer (`routes/`)

- **RESTful API design** with proper HTTP methods
- **Middleware integration** for validation and async handling
- **Parameter validation** for route parameters

## Testing Utilities and Helpers

### Global Test Utilities

- **`mocks.createMockReqRes()`** - Standardized Express request/response mocks
- **Global setup/teardown** - Database connection management
- **Jest configuration** - Path aliases and test patterns

### Test Data Patterns

- **Consistent mock naming** (mock{ModuleName}, mockCreateInput, etc.)
- **Reusable test data** across multiple test files
- **Edge case coverage** for validation and error handling

## Configuration Files

### Jest Configuration (`jest.config.json`)

```json
{
  "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

### Path Aliases

- `@/` - Root src directory
- `@modules/` - Modules directory
- `@utils/` - Utilities directory

## Module Creation Guide

### Step-by-Step Implementation

1. **Create directory structure** following the pattern:

   ```
   {newModuleName}/
   ├── constant/
   ├── controllers/
   ├── models/
   ├── routes/
   ├── services/
   ├── types/
   └── validators/
   ```

2. **Implement layers in order**:

   - Constants and types
   - Validators with Zod schemas
   - Models with Mongoose
   - Services with business logic
   - Controllers with HTTP handling
   - Routes with middleware integration

3. **Follow established patterns**:
   - Use the same import/export structure
   - Follow the same error handling patterns
   - Use consistent response formats
   - Apply the same validation patterns

### Template Placeholders

When creating a new module, replace the following placeholders:

- `{moduleName}` - lowercase module name (e.g., "user", "product", "order")
- `{ModuleName}` - PascalCase module name (e.g., "User", "Product", "Order")
- `MODULE_STATUS` - Replace with appropriate status enum for your module
- Add module-specific fields in mock data and interfaces

## Best Practices to Follow

1. **Separation of Concerns** - Clear layer boundaries
2. **Type Safety** - Full TypeScript integration
3. **Error Handling** - Consistent error patterns
4. **Validation** - Input validation at API boundaries
5. **Documentation** - Clear code organization and naming

This template ensures maintainability, and consistency across the entire codebase. Adapt the specific fields, validation rules, and business logic to match your module's requirements.
