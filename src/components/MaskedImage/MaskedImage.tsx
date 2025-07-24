import React from 'react';
import styles from './MaskedImage.module.css';

interface IMaskedImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

const MaskedImage: React.FC<IMaskedImageProps> = ({
  src,
  alt = 'Under Mask',
  width = 300,
  height = 300,
}) => {
  return (
    <div className={styles.wrapper} style={{ width, height }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={styles.image}
        draggable={false}
      />
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
};

export default MaskedImage;
