import ModalButton from "../modal-button/modal-button";
import classes from "./modal-delete-db.module.css";
import Modal from "react-modal";

export default function ModalDeleteDb({ modalIsOpen, handleCloseModal, handleClean }) {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      className={classes.modal}
      overlayClassName={classes.overlay}
    >
      <h2 className={classes.h2}>Вы уверены, что хотите удалить всю информацию из базы данных?</h2>
      <div className={classes.buttons}>
        <ModalButton onClick={handleClean} redStyle className={classes.agreeButton}>
          Да, удалить
        </ModalButton>
        <ModalButton onClick={handleCloseModal} greenStyle className={classes.cancelButton}>
          Нет, отменить
        </ModalButton>
      </div>
    </Modal>
  );
}
