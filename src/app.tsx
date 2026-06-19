import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import useAppStore from '@/store';

function App(props) {
  const hydrate = useAppStore((s) => s.hydrate);
  const regenerateTodayReminders = useAppStore((s) => s.regenerateTodayReminders);

  useEffect(() => {
    hydrate();
    regenerateTodayReminders();
  }, [hydrate, regenerateTodayReminders]);

  useDidShow(() => {
    regenerateTodayReminders();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
