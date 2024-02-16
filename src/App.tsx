import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { Quote as QuoteType } from "./types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { nanoid } from "nanoid";

const initial: QuoteType[] = [];

const grid = 8;
const reorder = (list, startIndex, endIndex): QuoteType[] => {
  const result: QuoteType[] = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const QuoteItem = styled.div`
  width: 200px;
  border: 1px solid grey;
  margin-bottom: ${grid}px;
  background-color: lightblue;
  padding: ${grid}px;
`;

function Quote({ quote, index, onDelete, onEdit }) {
  const handleDelete = () => {
    onDelete(quote.id);
  };
  const handleEdit = () => {
    onEdit(quote);
  };

  return (
    <Draggable draggableId={quote.id} index={index}>
      {(provided) => (
        <div
          className="d-flex justify-content-center align-items-start gap-3 "
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <QuoteItem>{quote.content}</QuoteItem>
          <Button onClick={handleEdit} variant="primary">
            Düzenle
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Sil
          </Button>
        </div>
      )}
    </Draggable>
  );
}

const QuoteList = React.memo(function QuoteList({
  quotes,
  onDelete,
  onEdit, // onDelete prop'unu doğru şekilde aldığınızdan emin olun
}: {
  quotes: QuoteType[];
  onDelete: (quoteId: string) => void; // onDelete prop'unun tipini doğru şekilde belirtin
  onEdit: (quote: QuoteType) => void;
}) {
  return quotes.map((quote: QuoteType, index: number) => (
    <Quote
      quote={quote}
      index={index}
      key={quote.id}
      onDelete={onDelete}
      onEdit={onEdit}
    /> // onDelete prop'unu Quote bileşenine ileterek hatayı giderin
  ));
});

export default function QuoteApp() {
  const [state, setState] = useState<{ quotes: QuoteType[] }>({
    quotes: initial,
  });
  const [quoteContent, setQuoteContent] = useState("");
  const [show, setShow] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteType | null>(null);
  const [modalQuoteContent, setModalQuoteContent] = useState("");

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleEdit = (quote) => {
    setEditingQuote(quote); // Düzenlenen quote'ı state'e kaydet
    setModalQuoteContent(quote.content); // Düzenlenen quote'ın içeriğini input alanına yükle
    handleShow(); // Modal'ı aç
  };

  const handleSave = () => {
    if (editingQuote) {
      const updatedQuotes = state.quotes.map((quote) =>
        quote.id === editingQuote.id
          ? { ...quote, content: modalQuoteContent }
          : quote
      );
      setState({ quotes: updatedQuotes });
    }
    handleClose();
  };

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const quotes = reorder(
      state.quotes,
      result.source.index,
      result.destination.index
    );

    setState({ quotes });
  }

  // Quote Eklemek İçin

  const addQuote = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newQuote = {
      id: nanoid(),
      content: quoteContent,
    };
    if (quoteContent !== "") {
      setState((oldQuote) => ({ quotes: [...oldQuote.quotes, newQuote] }));
      setQuoteContent("");
    } else {
      alert("Lütfen Boş Bırakmayınız");
    }
  };

  // Quote Silmek İçin
  //Ahmet Hocaya Sor neden quotes: demek zorundayız ve 103.satırın sonundaki virgül ne alaka?

  const deleteQuote = (quoteId) => {
    setState((oldState) => ({
      quotes: oldState.quotes.filter((quote) => quote.id !== quoteId),
    }));
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={modalQuoteContent}
            onChange={(e) => setModalQuoteContent(e.target.value)}
            placeholder={editingQuote ? editingQuote.content : ""}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <QuoteList
                quotes={state.quotes}
                onDelete={deleteQuote}
                onEdit={handleEdit}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div>
          <input
            type="text"
            value={quoteContent}
            onChange={(e) => setQuoteContent(e.target.value)}
          />
          <button onClick={addQuote}>Ekle</button>
        </div>
      </DragDropContext>
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<QuoteApp />, rootElement);
