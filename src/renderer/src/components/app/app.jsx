import BottomButton from "../bottom-button/bottom-button";
import ModalDeleteDb from "../modal-delete-db/modal-delete-db";
import ModalGenerateDb from "../modal-generate-db/modal-generate-db";
import classes from "./app.module.css";
import { useState } from "react";

export default function App() {
  // const [data, setData] = useState([]);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [generateModalIsOpen, setGenerateModalIsOpen] = useState(false);

  function handleClean() {
    window.api.clearData();
    setDeleteModalIsOpen(false);
  }

  function handleGenerate(number) {
    window.api.generateData(number);
    setGenerateModalIsOpen(false);
  }

  return (
    <>
      <main className={classes.main}></main>
      <footer className={classes.footer}>
        <BottomButton
          className={classes.cleanButton}
          redStyle
          onClick={() => setDeleteModalIsOpen(true)}
        >
          Очистить БД
        </BottomButton>
        <ModalDeleteDb
          modalIsOpen={deleteModalIsOpen}
          handleCloseModal={() => setDeleteModalIsOpen(false)}
          handleClean={handleClean}
        />
        <BottomButton
          className={classes.generateButton}
          onClick={() => setGenerateModalIsOpen(true)}
        >
          Сгенерировать БД
        </BottomButton>
        <ModalGenerateDb
          modalIsOpen={generateModalIsOpen}
          handleCloseModal={() => setGenerateModalIsOpen(false)}
          handleGenerate={handleGenerate}
        />
      </footer>
    </>
  );
}
