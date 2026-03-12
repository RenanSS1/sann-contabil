import React from 'react';

interface AdContainerProps {
  height?: string | number;
  width?: string | number;
  children?: React.ReactNode;
}

export const AdContainer = ({ height, width, children }: AdContainerProps) => {
  const isDev = /aistudio|localhost|dev/.test(window.location.hostname);

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50 flex flex-col items-center justify-center min-h-[120px]"
      style={{ height, width }}
    >
      <span className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
        Publicidade
      </span>
      
      {isDev || !children ? (
        <div className="text-sm text-gray-400 italic">
          Espaço reservado para anúncio
        </div>
      ) : (
        children
      )}
    </div>
  );
};
