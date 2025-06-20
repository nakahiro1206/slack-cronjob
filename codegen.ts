import type { CodegenConfig } from '@graphql-codegen/cli'
import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files'
 
const config: CodegenConfig = {
  schema: './src/schema/**/*.gql',
  documents: ['./src/documents/**/*.gql'],
  generates: {
    './src/documents/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ]
    },
    './src/schema': defineConfig(),
  }
}
 
export default config