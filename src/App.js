import './App.css';
import VideoChatContainer from './Components/VideoChatContainer';
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'

function App() {
  return (
    <Container fluid>
      <Navbar fixed="top">
        <h1 className="p-3 text-center">Interest Call</h1>
      </Navbar>
            <VideoChatContainer />
    </Container>
  );
}

export default App;
