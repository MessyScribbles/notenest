import { useState, useEffect } from 'react';
import * as Y from 'yjs';

export interface PageSettingsData {
  size: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginType: 'narrow' | 'normal' | 'wide';
  numberHeadings: boolean;
  width: string;
  height: string;
  padding: string;
}

export type PageSettings = PageSettingsData & {
  update: (newData: Partial<PageSettingsData>) => void;
};

export function usePageSettings(doc: Y.Doc): PageSettings {
  const yMap = doc.getMap('pageSettings');

  const getDefaultData = (): PageSettingsData => ({
    size: 'A4',
    orientation: 'portrait',
    marginType: 'normal',
    numberHeadings: false,
    width: '794px',
    height: '1123px',
    padding: '96px',
  });

  const [settings, setSettings] = useState<PageSettingsData>(() => {
    return (yMap.get('data') as PageSettingsData) || getDefaultData();
  });

  useEffect(() => {
    const observer = () => {
      const data = yMap.get('data') as PageSettingsData;
      if (data) setSettings(data);
    };
    yMap.observe(observer);
    return () => yMap.unobserve(observer);
  }, [yMap]);

  const update = (newData: Partial<PageSettingsData>) => {
    const current = (yMap.get('data') as PageSettingsData) || getDefaultData();
    const updated = { ...current, ...newData };

    if (updated.size === 'A4') {
      updated.width = updated.orientation === 'portrait' ? '794px' : '1123px';
      updated.height = updated.orientation === 'portrait' ? '1123px' : '794px';
    } else if (updated.size === 'Letter') {
      updated.width = updated.orientation === 'portrait' ? '816px' : '1056px';
      updated.height = updated.orientation === 'portrait' ? '1056px' : '816px';
    } else {
      updated.width = updated.orientation === 'portrait' ? '816px' : '1344px';
      updated.height = updated.orientation === 'portrait' ? '1344px' : '816px';
    }

    if (updated.marginType === 'narrow') updated.padding = '48px';
    else if (updated.marginType === 'normal') updated.padding = '96px';
    else updated.padding = '144px';

    yMap.set('data', updated);
  };

  return { ...settings, update };
}