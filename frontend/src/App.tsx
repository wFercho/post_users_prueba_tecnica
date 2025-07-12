import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PostCreate from './pages/PostCreate';
import PostView from './pages/PostView';
import PostList from './pages/PostList';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyPosts from './pages/MyPosts';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/posts/:id" element={<PostView />} />
          <Route path="/create" element={<PostCreate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
