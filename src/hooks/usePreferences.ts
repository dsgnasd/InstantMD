import { useState, useEffect, useCallback } from 'react';
import { fonts, fontKey } from '../utils/constants';
import { FONT_SIZE } from '../utils/config';

export const usePreferences = () => {
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = parseInt(
      localStorage.getItem('instantmd-fontsize') || String(FONT_SIZE.default),
      10,
    );
    return Math.min(Math.max(saved, FONT_SIZE.min), FONT_SIZE.max);
  });

  const [font, setFontState] = useState(() => localStorage.getItem(fontKey) || 'inter');
  const [minimalMode, setMinimalMode] = useState(false);
  const [tocVisible, setTocVisibleState] = useState(
    () => localStorage.getItem('instantmd-toc-visible') === 'true',
  );

  const setTocVisible = useCallback((v: boolean) => setTocVisibleState(v), []);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(Math.min(Math.max(size, FONT_SIZE.min), FONT_SIZE.max));
  }, []);

  const setFont = useCallback((id: string) => setFontState(id), []);

  useEffect(() => {
    localStorage.setItem('instantmd-fontsize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    const fontObj = fonts.find((f) => f.id === font);
    if (fontObj) {
      document.body.style.fontFamily = fontObj.family;
      localStorage.setItem(fontKey, font);
    }
  }, [font]);

  useEffect(() => {
    localStorage.setItem('instantmd-toc-visible', String(tocVisible));
  }, [tocVisible]);

  return { fontSize, setFontSize, font, setFont, minimalMode, setMinimalMode, tocVisible, setTocVisible };
};
