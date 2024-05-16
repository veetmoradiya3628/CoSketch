import {io} from 'socket.io-client'
import { store } from '../store/store';
import { addActiveUserToBoard, removeActiveUserFromBoard, setElements, updateElement } from './../components/Whiteboard/whiteboardSlice';
import { removeCursorPosition, updateCursorPosition } from './../components/CursorOverlay/cursorSlice';

let socket;

export const connectWithSocketServer = (boardId) => {
    const userId = localStorage.getItem('userId')
    
    socket = io('http://localhost:5002', {
        query: {
            userId,
            boardId
        }
    })

    socket.on('connect', () => {
        console.log('connected to socket io server');
    })

    socket.on('BOARD_ELEMENTS', (element_data) => {
        console.log(`BOARD_ELEMENTS : ${element_data}`);
        store.dispatch(setElements(JSON.parse(element_data)));
    })

    socket.on('USER_BOARD_JOINED', (event_data) => {
        console.log(`USER_BOARD_JOINED`);
        store.dispatch(addActiveUserToBoard(event_data['user']));
    })

    socket.on('USER_BOARD_LEAVE', (event_data) => {
        console.log(`USER_BOARD_LEAVE`);
        console.log(event_data);
        store.dispatch(removeActiveUserFromBoard(event_data['user']));
    })

    // old socket events below to be deleted once new flow is getting implemente

    socket.on("whiteboard-state", (elements) => {
        console.log(elements);
        store.dispatch(setElements(elements));
    })

    socket.on("ELEMENT-UPDATE", (eventData) => {
        const { boardElements } = eventData;
        store.dispatch(updateElement(boardElements));
    })

    socket.on("whiteboard-clear", () => {
        store.dispatch(setElements([]));
    })

    socket.on("cursor-position", (cursorData) => {
        store.dispatch(updateCursorPosition(cursorData))
    })

    socket.on("user-disconnected", (disconnectedUserId) => {
        store.dispatch(removeCursorPosition(disconnectedUserId))
    })
}

export const emitElementUpdate = (elementData) => {
    const eventData = {
        "boardId": localStorage.getItem('boardId'),
        "boardElements": elementData 
    }
    socket.emit("ELEMENT-UPDATE", eventData);
}

export const emitClearWhiteboard = () => {
    socket.emit("whiteboard-clear");
}

export const emitCursorPosition = (cursorData) => {
    socket.emit("cursor-position", cursorData)
}

export const disconnectSocketConnection = () => {
    console.log(`disconnect socket connection called!!!`);
    socket.disconnect();
}