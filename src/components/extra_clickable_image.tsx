import React from 'react';
import Image, {ImageProps} from 'next/image';

import {Handler} from '@/types/handlers';
import styles from './extra_clickable_image.module.css';


type ExtraClickableImageProps = {
  clickHandler: Handler;
};

export default function ExtraClickableImage({clickHandler, ...imageProps}: ExtraClickableImageProps & ImageProps): React.ReactElement {
  return <div className={styles.wrapper} onClick={() => clickHandler()}>
    <Image {...imageProps} />
  </div>;
}
