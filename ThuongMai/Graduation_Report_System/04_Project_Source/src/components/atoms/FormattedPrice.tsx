'use client';

import React, { useState, useEffect } from 'react';

export const FormattedPrice: React.FC<{ value: number }> = ({ value }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{value.toString()} VND</span>;
  }

  return <span>{value.toLocaleString('vi-VN')} đ</span>;
};
