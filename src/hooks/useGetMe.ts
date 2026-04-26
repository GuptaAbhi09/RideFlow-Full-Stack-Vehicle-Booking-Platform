import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/redux/userSlice';

export const useGetMe = () => {
  const dispatch = useDispatch();

  const fetchUser = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        dispatch(setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return { fetchUser };
};
