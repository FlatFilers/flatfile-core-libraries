import { ISpace, getErrorMessage } from '@flatfile/embedded-utils';
import authenticate from './authenticate';

const useInitializeSpace = (flatfileOptions: ISpace) => {
  let space;

  const initializeSpace = async () => {
    try {
      const {
        publishableKey,
        environmentId,
        name = 'Embedded Space',
        spaceBody,
        apiUrl,
        spaceUrl = 'https://spaces.flatfile.com/',
        workbook,
      } = flatfileOptions;

      if (!publishableKey) {
        throw new Error('Missing required publishable key');
      }

      if (!environmentId) {
        throw new Error('Missing required environment id');
      }

      const limitedAccessApi = authenticate(publishableKey, apiUrl);
      const spaceRequestBody = {
        name,
        autoConfigure: false,
        ...spaceBody,
      };

      
      if (!workbook) {
        spaceRequestBody.autoConfigure = true;
      }

      try {
        space = await limitedAccessApi.spaces.create({
          environmentId,
          ...spaceRequestBody,
        });
      } catch (error) {
        throw new Error(`Failed to create space: ${getErrorMessage(error)}`);
      }

      if (!space) {
        throw new Error(
          `Failed to create space: Error parsing token: ${publishableKey}`,
        );
      }

      if (!space.data.accessToken) {
        throw new Error('Failed to retrieve accessToken');
      }

      if (!space.data.guestLink) {
        const guestLink = `${spaceUrl}space/${space.data.id}?token=${space.data.accessToken}`;
        space.data.guestLink = guestLink;
      }

      return space;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error(`Failed to initialize space: ${message}`);
      throw error;
    }
  };

  return { space, initializeSpace };
};

export default useInitializeSpace;