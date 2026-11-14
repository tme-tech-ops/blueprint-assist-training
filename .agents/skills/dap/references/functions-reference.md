# Blueprint Assist — Skill Functions Reference

> GENERATED FILE — DO NOT EDIT
>
> Source: `packages/core/src/skill-functions/*.ts`

## buildLineageLabels

Description:
Build labels array containing promotion lineage metadata.

Signature:
```ts
buildLineageLabels(lineage: Partial<PromotionLineage>): Array<{ key: string; value: string }>
```

## cancelExecution

Description:
Cancel a running execution.

Signature:
```ts
cancelExecution(credentials: Credentials, executionId: string, options?: CancelExecutionOptions): Promise<void>
```

## createDeployment

Description:
Create a new deployment from a blueprint.

Signature:
```ts
createDeployment(credentials: Credentials, params: CreateDeploymentParams): Promise<Deployment>
```

## createSecret

Description:
Create a new secret.

Signature:
```ts
createSecret(credentials: Credentials, params: CreateSecretParams): Promise<Secret>
```

## deleteBlueprint

Description:
Delete a blueprint.

Signature:
```ts
deleteBlueprint(credentials: Credentials, blueprintId: string, options?: DeleteBlueprintOptions): Promise<void>
```

## deleteDeployment

Description:
Delete a deployment.

Signature:
```ts
deleteDeployment(credentials: Credentials, deploymentId: string, options?: DeleteDeploymentOptions): Promise<void>
```

## extractPromotionLineage

Description:
Extract promotion lineage metadata from deployment record or labels.

Signature:
```ts
extractPromotionLineage(deployment: Partial<Deployment> | Record<string, unknown>): PromotionLineage | undefined
```

## findBlueprintExamples

Description:
Find blueprint examples in the local knowledge base.

This operation does NOT require DAP credentials (local only).

Signature:
```ts
findBlueprintExamples(options?: FindExamplesOptions): Promise<ExampleResult[]>
```

Usage:

```typescript
const examples = await findBlueprintExamples({
  query: 'aws ec2',
  plugin: 'aws',
  limit: 5
});
console.log(`Found ${examples.length} examples`);
```

## getBlueprint

Description:
Get a single blueprint by ID.

Signature:
```ts
getBlueprint(credentials: Credentials, blueprintId: string): Promise<Blueprint>
```

## getBlueprintExample

Description:
Get a blueprint example by ID.

This operation does NOT require DAP credentials (local only).

Signature:
```ts
getBlueprintExample(exampleId: string, options?: GetExampleOptions): Promise<ExampleResult>
```

Usage:

```typescript
const example = await getBlueprintExample('aws-ec2-basic', {
  includeFiles: true
});
console.log(`Files: ${Object.keys(example.files || {}).join(', ')}`);
```

## getCredentials

Description:
Get credentials from config file or environment variables (fallback).

This is the most flexible approach:
1. Try to load from config file
2. If config doesn't exist or is incomplete, try environment variables
3. If both fail, throw error

Authentication priority (first available wins):
1. OAuth Client Credentials (clientId + clientSecret) - PREFERRED
2. API Token (token)

Signature:
```ts
getCredentials(profileName?: string): Credentials
```

Usage:

```typescript
import { getCredentials, listDeployments } from '@blueprint-assist/core/skill-functions';

const credentials = getCredentials();
const deployments = await listDeployments(credentials);
```

## getCredentialsFromConfig

Description:
Get credentials from BPA config file.

This is the recommended way for skills to obtain credentials.
Loads from ~/.blueprint-assist/config.json or environment variables.

Authentication priority (first available wins):
1. OAuth Client Credentials (clientId + clientSecret) - PREFERRED
2. API Token (token)
3. Username + Password (legacy, not recommended)

Signature:
```ts
getCredentialsFromConfig(profileName?: string): Credentials
```

Usage:

```typescript
import { getCredentialsFromConfig, listDeployments } from '@blueprint-assist/core/skill-functions';

const credentials = getCredentialsFromConfig();
const deployments = await listDeployments(credentials);
```

## getCredentialsFromEnv

Description:
Get credentials from environment variables.

Useful for CI/CD pipelines and automation scripts.

Authentication priority (first available wins):
1. OAuth: DAP_CLIENT_ID + DAP_CLIENT_SECRET - PREFERRED
2. Token: DAP_TOKEN

Required environment variables:
- DAP_ORCHESTRATOR_DOMAIN (required)
- DAP_CLIENT_ID + DAP_CLIENT_SECRET (OAuth, preferred)
  OR
- DAP_TOKEN (fallback)

Optional:
- DAP_TENANT (default: 'default_tenant')

Signature:
```ts
getCredentialsFromEnv(): Credentials
```

Usage:

OAuth
```typescript
import { getCredentialsFromEnv, listDeployments } from '@blueprint-assist/core/skill-functions';

// Set environment variables:
// DAP_ORCHESTRATOR_DOMAIN=dap.example.com
// DAP_CLIENT_ID=your-client-id
// DAP_CLIENT_SECRET=your-client-secret

const credentials = getCredentialsFromEnv();
const deployments = await listDeployments(credentials);
```

Token (fallback)
```typescript
// Set environment variables:
// DAP_ORCHESTRATOR_DOMAIN=dap.example.com
// DAP_TOKEN=your-api-token

const credentials = getCredentialsFromEnv();
const deployments = await listDeployments(credentials);
```

## getDeployment

Description:
Get a single deployment by ID.

Signature:
```ts
getDeployment(credentials: Credentials, deploymentId: string): Promise<Deployment>
```

## getEvents

Description:
Get events for a specific execution.

Signature:
```ts
getEvents(credentials: Credentials, executionId: string, options?: GetEventsOptions): Promise<EventsResponse>
```

## getExecution

Description:
Get a single execution by ID.

Signature:
```ts
getExecution(credentials: Credentials, executionId: string): Promise<Execution>
```

## getNodeTypeReference

Description:
Get node type documentation from the local knowledge base.

This operation does NOT require DAP credentials (local only).

Signature:
```ts
getNodeTypeReference(plugin: string, nodeType: string): Promise<NodeTypeDoc>
```

Usage:

```typescript
const doc = await getNodeTypeReference('aws', 'dell.nodes.aws.ec2.Instance');
console.log(`Properties: ${Object.keys(doc.properties).join(', ')}`);
```

## getRetryDelay

Description:
Get retry delay from HTTP response headers or use default.

Signature:
```ts
getRetryDelay(headers?: Record<string, string>, defaultDelay: any): number
```

## getSecret

Description:
Get secret metadata by name.

Note: The secret value is never returned, only metadata.

Signature:
```ts
getSecret(credentials: Credentials, secretName: string): Promise<Secret>
```

## isNetworkError

Description:
Check if an error is a network error that can be retried.

Signature:
```ts
isNetworkError(error: any): boolean
```

## isRecoverableHttpStatus

Description:
Check if an HTTP status code indicates a recoverable error.

Signature:
```ts
isRecoverableHttpStatus(status: number): boolean
```

## lintBlueprint

Description:
Lint a blueprint YAML file.

This operation does NOT require DAP credentials (local only).

Signature:
```ts
lintBlueprint(blueprintPath: string, options?: LintBlueprintOptions): Promise<LintResult>
```

Usage:

```typescript
const result = await lintBlueprint('./blueprint.yaml', { strict: true });
if (!result.valid) {
  result.errors.forEach(err => console.error(`Line ${err.line}: ${err.message}`));
}
```

## lintBlueprintContent

Description:
Lint blueprint YAML content (without requiring a file).

This is identical to lintBlueprint but accepts blueprint content directly
instead of a file path. Useful for validating generated blueprints before
writing them to disk.

Signature:
```ts
lintBlueprintContent(content: string, options?: LintBlueprintOptions): Promise<LintResult>
```

Usage:

```typescript
const yamlContent = `tosca_definitions_version: dell_1_1\n...`;
const result = await lintBlueprintContent(yamlContent, { strict: true });
if (!result.valid) {
  result.errors.forEach(err => console.error(`Line ${err.line}: ${err.message}`));
}
```

## listBlueprints

Description:
List all blueprints with optional filtering and pagination.

Signature:
```ts
listBlueprints(credentials: Credentials, options?: BlueprintListOptions): Promise<BlueprintListResult>
```

## listDeployments

Description:
List all deployments with optional filtering and pagination.

Signature:
```ts
listDeployments(credentials: Credentials, options?: DeploymentListOptions): Promise<DeploymentListResult>
```

## listEvents

Description:
List events with optional time filtering.

Signature:
```ts
listEvents(credentials: Credentials, options?: EventListOptions): Promise<EventListResult>
```

## listExecutions

Description:
List executions with optional filtering.

Signature:
```ts
listExecutions(credentials: Credentials, deploymentId?: string, options?: ExecutionListOptions): Promise<ExecutionListResult>
```

## listSecrets

Description:
List secrets with optional filtering.

Note: Secret values are never returned, only metadata.

Signature:
```ts
listSecrets(credentials: Credentials, options?: SecretListOptions): Promise<SecretListResult>
```

## prepareCreateDeploymentPayload

Description:
Client-agnostic preparation helper for deployment creation with promotion inputs and lineage.

Signature:
```ts
prepareCreateDeploymentPayload(params: CreateDeploymentParams & {
    description?: string;
    tags?: Array<{ key: string; value: string }>;
    pipelineRunId?: string;
    pipelineName?: string;
    gitCommit?: string;
    promotedFrom?: string;
    blueprintVersion?: string;
    blueprintInputs?: Record<string, unknown>;
  }): PreparedCreateDeploymentPayload
```

## prepareUpdateDeploymentPayload

Description:
Client-agnostic preparation helper for deployment updates with promotion inputs and lineage.

Signature:
```ts
prepareUpdateDeploymentPayload(deploymentId: string, updates: UpdateDeploymentParams & {
    pipelineRunId?: string;
    pipelineName?: string;
    gitCommit?: string;
    promotedFrom?: string;
  }): PreparedUpdateDeploymentPayload
```

## reconstructPromotionLineage

Description:
Reconstruct the promotion lineage chain across multiple environment deployments
using a deterministic topological walk O(N).

Signature:
```ts
reconstructPromotionLineage(deployments: Array<Partial<Deployment> | Record<string, unknown>>): {
  blueprint_id?: string;
  blueprint_version?: string;
  environments: string[];
  chain: PromotionLineage[];
}
```

## resolveDeploymentInputs

Description:
Resolve environment-specific inputs and check for missing required inputs.

Signature:
```ts
resolveDeploymentInputs(options: ResolveDeploymentInputsOptions): ResolvedDeploymentInputsResult
```

## stampBlueprintFile

Description:
Stamp the BpA origin indicator into a local blueprint file (in place).

This operation does NOT require DAP credentials (local only).

Refresh semantics: any existing indicator block is stripped, the content
checksum is recomputed over the current body, and a fresh block (current
timestamp, BpA version, indicator version, sha256 checksum) is prepended.
Call this as the final step after generating or editing blueprint YAML so
locally written blueprints carry the indicator even when never uploaded.

Containment: this is the only skill function that WRITES to a caller
supplied path, so the target must have a `.yaml`/`.yml` extension and the
write is atomic (temp file + rename). Hosts must not expose this function
with unvalidated, caller-controlled paths.

Signature:
```ts
stampBlueprintFile(blueprintPath: string): Promise<IndicatorMetadata>
```

Usage:

```typescript
const metadata = await stampBlueprintFile('./blueprint.yaml');
console.log(metadata.checksum); // sha256:<64-hex>
```

## startExecution

Description:
Start a workflow execution on a deployment.

Signature:
```ts
startExecution(credentials: Credentials, deploymentId: string, params: StartExecutionParams): Promise<Execution>
```

## updateDeployment

Description:
Update deployment metadata (display name, description, tags, inputs, lineage).

Signature:
```ts
updateDeployment(credentials: Credentials, deploymentId: string, updates: UpdateDeploymentParams): Promise<Deployment>
```

## uploadBlueprint

Description:
Upload a blueprint archive to DAP.

Supports two modes:
1. File path mode: Upload from filesystem (.zip, .tar.gz, .tgz, .yaml files,
   or a blueprint directory — packaged as a zip automatically)
2. Inline content mode: Upload from in-memory content (via options.content)

Signature:
```ts
uploadBlueprint(credentials: Credentials, blueprintPathOrId: string, options?: UploadBlueprintOptions): Promise<Blueprint>
```

## validateBlueprint

Description:
Validate a blueprint against plugin schemas.

This operation does NOT require DAP credentials (local only).
Requires local plugin access via searchPath.

Signature:
```ts
validateBlueprint(blueprintPath: string, options?: ValidateBlueprintOptions): Promise<ValidationResult>
```

Usage:

```typescript
const result = await validateBlueprint('./blueprint.yaml', {
  searchPath: '~/.blueprint-assist/knowledge/plugins'
});
if (!result.valid) {
  result.errors.forEach(err => console.error(`${err.path}: ${err.message}`));
}
```

## validateDeploymentInputs

Description:
Validate deployment inputs, throwing NonRecoverableError with code 'MISSING_REQUIRED_INPUTS'
if any required inputs are missing.

Signature:
```ts
validateDeploymentInputs(options: ResolveDeploymentInputsOptions): Record<string, unknown>
```
