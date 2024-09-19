import { FC } from 'react';
import { Space, Workbook, useFlatfile, useListener,  } from '@flatfile/react';
import FlatfileListener from '@flatfile/listener';
import { CreateWorkbookConfig } from '@flatfile/api/api';

interface ActionComponentProps {
  open: boolean;
  closePortal: () => void;
  openPortal: () => void;
}

export const FlatFilePlatform: FC<{
  workbook: CreateWorkbookConfig;
  listener: (client: FlatfileListener) => void;
  ActionComponent: React.FC<ActionComponentProps>;
}> = (props) => {

  const { workbook, listener, ActionComponent } = props;
  
  const { open, openPortal, closePortal } = useFlatfile();
  useListener(listener, [listener])


  return <div className="content">
  <ActionComponent
    open={open}
    closePortal={closePortal}
    openPortal={openPortal}
  />
  <Space
    config={{
      name: 'Test Space',
      metadata: {
        sidebarConfig: {
          showSidebar: false,
        },
      },
    }}
  >
    <Workbook
      config={workbook}
      onSubmit={() => {
        console.log('submitted');
      }}
    />
  </Space>
</div>
};
