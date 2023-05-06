import React from 'react';
import Image, {ImageProps} from 'next/image';

import {Handler} from '@/types/handlers';
import styles from './extra_clickable_image.module.css';


type ExtraClickableImageProps = {
  clickHandler: Handler<void>;
  alt: string;
};

export default function ExtraClickableImage({clickHandler, alt, ...imageProps}: ExtraClickableImageProps & ImageProps): React.ReactElement {
  return <div className={styles.wrapper} onClick={() => clickHandler()}>
    <Image alt={alt} {...imageProps} />
  </div>;
}
