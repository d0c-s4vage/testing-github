import Head from 'next/head'

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/context';
import type {AppContextType} from '@/components/context';
import DataTable, { HeaderSpec } from '@/components/data_table';
import { Item } from '@/models/all';
import ExtraClickableImage from '@/components/extra_clickable_image';

import styles from './index.module.css';
import utils from '@/lib/utils';
import type { Handler } from '@/types/handlers';

import trashImg from './trash.png';
import editImg from './edit.png';

import ItemModal from '@/components/modals/item';

function makeTableHeaders(params: AppContextType & { editHandler: Handler<Item> }): HeaderSpec<Item>[] {
  const res: HeaderSpec<Item>[] = [
    {
      display: "Done",
      width: 80,
      center: true,
      value: (item: Item) => {
        return <input
          type="checkbox"
          defaultChecked={item.completed}
          className="roundCheckbox"
          onChange={(e) => {
            item.completed = e.target.checked;
            params.stateMutator?.editItem(item);
          }}
        />;
      },
    },
    { display: "Name", value: (item: Item) => item.name, width: 200, ellipsis: true },
    { display: "Description", value: (item: Item) =>  item.description, ellipsis: true },
    {
      display: "",
      width: 50,
      value: (item: Item) => (
        <ExtraClickableImage
          clickHandler={() => {
            params.editHandler(item);
          }}
          src={editImg}
          alt="A pencil writing. Clicking will edit the current item"
          width={20}
        />
      )
    },
    {
      display: "",
      width: 50,
      value: (item: Item) => (
        <ExtraClickableImage
          clickHandler={() => {
            params.stateMutator?.deleteItem(item);
          }}
          src={trashImg}
          alt="Trash image that will delete the item when clicked"
          width={20}
        />
      )
    },
  ];

  return res;
}

type ModalEditState = {
  item: Item | null;
  isNew: boolean;
};

export default function Home() {
  const {state, stateMutator} = useContext(AppContext);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems([...state.items]);
  }, [state]);

  const [modalState, setModalState] = useState<ModalEditState>({ item: null, isNew: false});

  // NOTE: we edit a *copy* of the item and then replace the real one in the state
  // once the user clicks save! See "onSave" below
  const editItem = (item: Item) => {
    setModalState({ item: Item.fromObj(item.toObj()), isNew: false });
  }
  const newItem = () => setModalState({ item: new Item(), isNew: true });
  const hideModal = () => setModalState({ item: null, isNew: false });
  const newRandomItem = () => {
    stateMutator?.newItem(new Item(
      "random Item",
      "Random description",
      false,
    ));
  };

  const headers = makeTableHeaders({
    state,
    stateMutator,
    editHandler: (item) => editItem(item),
  });

  return <>
    <Head>
    </Head>

    <div className={styles.greeting}>
      Hello! you have {state.items?.length} items in the list
    </div>

    <div className={styles.tableContainer}>
      <DataTable<Item>
        data={items}
        headers={headers}
        keyFn={(item) => item.uuid + "-" + utils.objectId(item)}
      />

      <div className={styles.buttonRow}>
        <button
          onClick={()=> newRandomItem()}
          className={"greenBtn"}
        >Random</button>
        <button
          onClick={()=> newItem()}
          className={`successBtn ${styles.addBtn}`}
        >＋</button>
      </div>
    </div>


    <ItemModal
      title={modalState.isNew ? "Add a new item" : "Edit the item"}
      item={modalState.item}
      onSave={(item: Item) => {
        if (modalState.isNew) {
          stateMutator?.newItem(item);
        } else {
          stateMutator?.editItem(item);
        }
        hideModal();
      }}
      onCancel={() => {
        hideModal();
      }}
    />
  </>;
}
