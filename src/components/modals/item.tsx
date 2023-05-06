import React, { useRef, useEffect, useState } from 'react';
import Body from 'next/body';

import { Item } from '@/models/all';
import { Handler } from '@/types/handlers';

import styles from './item.module.css';

export type ItemModalProps = {
  title: string;
  item: Item | null;
  onSave: Handler<Item>;
  onCancel: Handler<void>;
};

export default function ItemModal(props: ItemModalProps): React.ReactElement {
  if (props.item == null) {
    return <></>;
  }

  let item: Item = props.item;

  let nameEdit = useRef<HTMLInputElement>(null);
  let descEdit = useRef<HTMLTextAreaElement>(null);
  let completedEdit = useRef<HTMLInputElement>(null);

  let handleSave = () => {
    item.name = nameEdit.current?.value || "";
    item.description = descEdit.current?.value || "";
    item.completed = completedEdit.current?.checked || false;
    props.onSave(item);
  };

  return (
    <>
      <div className={styles.background}/>
      <div className={styles.overlay} onClick={() => props.onCancel()}>
        <div
          className={styles.container}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.title}>{props.title}</div>
          </div>

          <div className={styles.content}>
            <div className={styles.fieldEdit}>
              <label htmlFor="uuid">ID</label>
              <input name="uuid" disabled={true} value={props.item.uuid}/>
            </div>

            <div className={styles.fieldEdit}>
              <label htmlFor="name">Name</label>
              <input name="name" ref={nameEdit} defaultValue={props.item.name} autoFocus={true}></input>
            </div>

            <div className={styles.fieldEdit}>
              <label htmlFor="desc">Description</label>
              <textarea name="desc" ref={descEdit} defaultValue={props.item.description}></textarea>
            </div>

            <div className={styles.fieldEdit}>
              <label htmlFor="completed">Completed</label>
              <input name="completed" ref={completedEdit} type="checkbox" defaultChecked={props.item.completed} />
            </div>
          </div>

          <div className={styles.footer}>
            <button className="errorBtn" onClick={() => props.onCancel()}>Cancel</button>
            <button className="successBtn" onClick={() => handleSave()}>Save</button>
          </div>

        </div>
      </div>
    </>
  );
}
