import promptsPackage from 'prompts'

export const prompt = async (...args: Parameters<typeof promptsPackage>) => {
  return promptsPackage(...args)
}

export default promptsPackage 