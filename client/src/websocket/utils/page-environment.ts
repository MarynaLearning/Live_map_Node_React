import type { IPageEnvironment } from '@/websocket/types';

/**
 * @Description Adapts the browser's visibility and online events to IPageEnvironment
 * @param pageDocument
 * @param pageWindow
 */
export const createPageEnvironment = (pageDocument: Document, pageWindow: Window): IPageEnvironment => {
  const isPageVisible = () => pageDocument.visibilityState === 'visible';

  const subscribeToVisibility = (listener: (isVisible: boolean) => void) => {
    const handleVisibilityChange = () => {
      listener(isPageVisible());
    };

    pageDocument.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      pageDocument.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const subscribeToOnline = (listener: () => void) => {
    pageWindow.addEventListener('online', listener);

    return () => {
      pageWindow.removeEventListener('online', listener);
    };
  };

  return { isPageVisible, subscribeToVisibility, subscribeToOnline };
};
