import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './fontello/css/fontello.css';

class Header extends React.Component {
    render() {
        var header;

        if (this.props.view === "noteslist") {
            header = <header><h1>Notes</h1></header>
        }
        else if (this.props.view === "noteeditor") {
            header = <header>
                <button className="icon-back" onClick={this.props.closeEditor}></button>
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
                        <div className="title">{note.title}</div>
                        <div className="date">{new Date(note.created).toLocaleString()}</div>
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
                                <i className="icon-delete"></i>
                                Delete
                            </div>
                            <div onClick={() => this.hideMenu()}>
                                <i className="icon-cancel"></i>
                                Cancel
                            </div>
                        </div>
                    </div>;
            }
        }

        return (
            <div className="notes_list">
                {listContent}
                {noteMenu}
                <button className="icon-add" onClick={this.props.createNote}></button>
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

        var view = this.state.editorID ? "noteeditor" : "noteslist";
        var main_content;

        if (view === "noteslist") {
            main_content = 
                <NotesList
                    notes={this.state.notes}
                    openNote={(e) => this.openNote(e)}
                    createNote={() => this.createNote()}
                    deleteNote={(e) => this.deleteNote(e)}
                />
        }
        else if (view === "noteeditor") {
            main_content =
                <NoteEditor
                    noteToEdit={noteToEdit}
                    saveNote={((e) => this.saveNote(e))}
                />
        }


        return (
            <div className="App">
                <Header
                    view={view}
                    closeEditor={() => this.closeEditor()}
                />
 
                {main_content}
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
        created: "YYYY-MM-DD",
        lastUpdated: "YYYY-MM-DD"
    },
    ...
]
*/

/*
sort by lastUpdated:
notes.sort((a, b) => (a.lastUpdated < b.lastUpdated) ? 1 : -1)
*/
