import BottomButton from "../bottom-button/bottom-button";
import ModalDeleteDb from "../modal-delete-db/modal-delete-db";
import ModalGenerateDb from "../modal-generate-db/modal-generate-db";
import classes from "./app.module.css";
import { useState, useEffect } from "react";
import { Column, Table, AutoSizer } from "react-virtualized";

// Основной компонент приложения
export default function App() {
  const emptyData = [{ id: null, name: null, description: "Data is empty", age: null }]; // заглушка для пустых данных
  const [isLoading, setIsLoading] = useState(false); // во время загрузки отображаем песочные часы
  const [data, setData] = useState(emptyData); // данные из базы
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // состояние модального окна очистки базы
  const [generateModalIsOpen, setGenerateModalIsOpen] = useState(false); // состояние модального окна генерации данных

  // первоначальная загрузка данных из базы
  useEffect(() => {
    getData();
  }, []);

  // получение данных из базы
  async function getData() {
    setIsLoading(true);
    try {
      const resultData = await window.api.getData();
      console.log(resultData);
      if (resultData && resultData.length > 0) setData(resultData);
      else setData(emptyData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  }

  // очистка данных из базы
  async function handleClean() {
    setIsLoading(true);
    try {
      await window.api.clearData();
      setDeleteModalIsOpen(false);
      await getData();
    } catch (error) {
      console.error("Error clearing data", error);
    }
  }

  // генерация данных
  async function handleGenerate(number) {
    setIsLoading(true);
    try {
      await window.api.generateData(number);
      setGenerateModalIsOpen(false);
      await getData();
    } catch (error) {
      console.error("Error generating data", error);
    }
  }

  return (
    <>
      <main className={classes.main}>
        <AutoSizer>
          {({ height, width }) => (
            <Table
              className={classes.table}
              headerClassName={classes.tableHeader}
              rowClassName={classes.tableRow}
              gridClassName={classes.tableGrid}
              overscanRowCount={30}
              width={width}
              height={height}
              headerHeight={20}
              rowHeight={20}
              rowCount={data.length}
              rowGetter={({ index }) => data[index]}
            >
              <Column flexGrow={1} label="ID" dataKey="id" width={50} />
              <Column flexGrow={1} label="Name" dataKey="name" width={100} />
              <Column flexGrow={1} label="Description" dataKey="description" width={250} />
              <Column flexGrow={1} label="Age" dataKey="age" width={50} />
            </Table>
          )}
        </AutoSizer>
      </main>
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
          isLoading={isLoading}
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
          isLoading={isLoading}
        />
      </footer>
    </>
  );
}
