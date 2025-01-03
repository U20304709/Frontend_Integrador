'use client'
import React, { useState, useEffect } from 'react'
import IUser from '../types/user.type';
import AppUserService from '../services/user.service';
import UserList from './UserList';
import ShowModalBtn from '../components/ShowModalBtn';
import AddUserModal from './AddUserModal';

const Page = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [newUserModalOpen, setnewUserModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true)
    const fetchUsers = async () => {
      try {
        const response = await AppUserService.getAllUsers();
        setUsers(response.data);
        setError('')
      } catch (error: any) {
        const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to get users';
        setError(errMsg);
      }
      setLoading(false)
    }
    fetchUsers()
  }, []);

  const displayNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 5000);
  };

  const toggleNewUserModal = () => {
    setnewUserModalOpen((newUserModalOpen) => !newUserModalOpen)
  }

  const updateUsers = async (user: IUser, action: { type: string }) => {
    if (!user.id) return;
    switch (action.type) {
      case 'DELETE':
        try {
          const res = await AppUserService.deleteUser(user.id)
          setUsers((users) => {
            return users.filter((u) => u.id !== user.id)
          })
          displayNotification('User deleted successfully');
        } catch (error: any) {
          const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to delete user';
          setError(errMsg);
        }
        break;
      case 'UPDATE':
        try {
          const res = await AppUserService.updateUser(user.id, user)
          setUsers((users) => {
            return users.map((u) => u.id === user.id ? res.data : u)
          })
          displayNotification('User updated successfully');
        } catch (error: any) {
          const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to update user';
          setError(errMsg);
        }
        break;
      default:
    }
  }

  const createNewUser = async (user: IUser) => {
    const res = await AppUserService.createUser(user)
    setUsers((users) => {
      return [...users, res.data]
    })
    displayNotification('User added successfully');
  }

  return (
    <>
      {loading && <div className="block loading loading-bars loading-lg mb-2"></div>}
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {notification && <div onClick={() => setNotification('')} className='toast toast-end toast-bottom z-50'><div className="alert alert-info text-white p-2">{notification}</div></div>}

      <ShowModalBtn text="Crear Nuevo Usuario" toggleModal={toggleNewUserModal} style="btn-accent" />

      <AddUserModal
        open={newUserModalOpen}
        toggleModal={toggleNewUserModal}
        addUser={createNewUser}
      />

      <UserList users={users} updateUsers={updateUsers} />
    </>
  )
}

export default Page