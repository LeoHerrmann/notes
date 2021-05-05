import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Header extends React.Component {
    render() {
        var header;

        if (this.props.view === "noteslist") {
            header = <header><h1>Notes</h1></header>
        }
        else if (this.props.view === "noteeditor") {
            header = <header>
                <button onClick={this.props.closeEditor}>Close</button>
                <h1>Edit</h1>
            </header>
        }

        return (
            <div>
                {header}

                <div className="placeholder"></div>
            </div>
        );
    }
}

class NotesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuVisible: false,
            menuID: null
        };
    }

    showMenu(e, id) {
        e.preventDefault();

        this.setState({
            menuVisible: true,
            menuID: id
        });
    }

    hideMenu() {
        this.setState({
            menuVisible: false,
            menuID: null
        });
    }

    render(props) {
        var listContent = <div className="placeholder_text">No notes</div>;
        var noteMenu;

        if (this.props.notes.length > 0) {
            listContent = [];

            for (let note of this.props.notes) {
                listContent.push(
                    <div
                        className="note"
                        key={note.id}
                        onClick={() => this.props.openNote(note.id)}
                        onContextMenu={(e) => this.showMenu(e, note.id)}
                    >
                        {note.title}
                    </div>
                );
            }

            if (this.state.menuVisible) {
                noteMenu =
                    <div className="menu">
                        <div
                            className="overlay"
                            onClick={() => this.hideMenu()}
                        ></div>
                        <div className="content">
                            <div
                                className="text_negative"
                                onClick={() => {this.props.deleteNote(this.state.menuID); this.hideMenu();}}
                            >
                                Delete
                            </div>
                            <div onClick={() => this.hideMenu()}>Cancel</div>
                        </div>
                    </div>;
            }
        }

        return (
            <div className="notes_list">
                {listContent}
                {noteMenu}
                <button onClick={this.props.createNote}>Create note</button>
            </div>
        );
    }
}

class NoteEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            noteToEdit: props.noteToEdit
        };
    }

    componentDidUpdate() {
        if (this.props.noteToEdit.id !== this.state.noteToEdit.id) {
            this.setState({
                noteToEdit: this.props.noteToEdit
            });
        }
    }

    handleTitleChange = event => {
        this.setState({
            noteToEdit: {
                id: this.state.noteToEdit.id,
                title: event.target.value,
                content: this.state.noteToEdit.content,
                created: this.state.noteToEdit.created
            }
        });
    };

    handleContentChange = event => {
        this.setState({
            noteToEdit: {
                id: this.state.noteToEdit.id,
                title: this.state.noteToEdit.title,
                content: event.target.value,
                created: this.state.noteToEdit.created
            }
        });
    };

    render(props) {
        if (this.props.noteToEdit.id) {
            return (
                <div className="note_editor">
                    <input
                        value={this.state.noteToEdit.title}
                        onChange={this.handleTitleChange}
                        placeholder="Title"
                    />
                    <textarea
                        value={this.state.noteToEdit.content}
                        onChange={this.handleContentChange}
                        placeholder="Content"
                    />
                    <button
                        className="save_note_button"
                        onClick={() => this.props.saveNote({
                            id: this.state.noteToEdit.id,
                            title: this.state.noteToEdit.title,
                            content: this.state.noteToEdit.content,
                            created: this.state.noteToEdit.created,
                            lastUpdated: new Date().toJSON()
                        })}
                    >
                        Save note
                    </button>
                </div>
            )
        }

        else {
            return null;
        }

    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            idCounter: 1,
            notes: [],
            editorID: null
        };

        var notesData = JSON.parse(localStorage.getItem("notesData"));

        if (notesData) {
            this.state.idCounter = notesData.idCounter;
            this.state.notes = notesData.notes;
        }
    }

    openNote(id) {
        this.setState({
            editorID: id
        });
    }

    createNote() {
        this.setState({
            editorID: this.state.idCounter,
            idCounter: this.state.idCounter + 1
        });
    }

    saveNote(note) {
        var editedNote = JSON.parse(JSON.stringify(note));
        var notes = JSON.parse(JSON.stringify(this.state.notes));
        var isNewNote = true;

        for (let i in notes) {
            if (notes[i].id === editedNote.id) {
                notes[i] = note;
                isNewNote = false;
                break;
            }
        }

        if (isNewNote) {
            notes.push(editedNote);
        }

        this.setState({notes: notes}, () => {
            this.saveToLocalStorage();
        });
    }

    deleteNote(id) {
        var notes = JSON.parse(JSON.stringify(this.state.notes));

        for (let i in notes) {
            if (notes[i].id === id) {
                notes.splice(i, 1);
                break;
            }
        }

        this.setState({notes: notes}, () => {
            this.saveToLocalStorage();
        });
    }

    saveToLocalStorage() {
        var notesData = {
            notes: this.state.notes,
            idCounter: this.state.idCounter
        };

        localStorage.setItem("notesData", JSON.stringify(notesData));
    }

    closeEditor() {
        this.setState({editorID: null});
    }

    render() {
        var noteToEdit = {
            id: this.state.editorID,
            title: "",
            content: "",
            created: new Date().toJSON()
        };

        for (let note of this.state.notes) {
            if (note.id === this.state.editorID) {
                noteToEdit = JSON.parse(JSON.stringify(note));
                break;
            }
        }

        return (
            <div className="App">
                <Header
                    view={this.state.editorID ? "noteeditor" : "noteslist"}
                    closeEditor={() => this.closeEditor()}
                />
 
                <NotesList
                    notes={this.state.notes}
                    openNote={(e) => this.openNote(e)}
                    createNote={() => this.createNote()}
                    deleteNote={(e) => this.deleteNote(e)}
                />

                <NoteEditor
                    noteToEdit={noteToEdit}
                    saveNote={((e) => this.saveNote(e))}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById("root")
);


/*
notesList = [
    {
        id: 99,
        title: "Title",
        content: "Content",
        creationDate: "YYYY-MM-DD",
        lastEdited: "YYYY-MM-DD"
    },
    ...
]
*/
