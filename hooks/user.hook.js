import APIClient from '../services/api'
// import {useQuery} from "react-query";
import {useQuery} from '@tanstack/react-query'
import {defaultQueryProps} from "@/app/providers";
import {auth} from "@/lib/firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {useState} from "react";


export const useUserIsLoggedIn = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    onAuthStateChanged(auth,  (user) => {
        if (user) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }})

    return isLoggedIn
}
export const useCurrentUser = ( props = {})  => {




    const queryKey = ['currentUser', props];

    const uid = auth.currentUser?.uid


    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!uid && APIClient.isReady,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/me`, { params: props})
    })


}

export const useUserFriends = ( userId = null, type = 'ACCEPTED', props)  => {

    const queryKey = ['friends', userId, type, props];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!userId,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/friends`, { params: {
                status: type,
                ...props
            }})
    })

};

export const useNotificationsByUser = ( isLoggedIn,showNotifications, props)  => {

    const queryKey = ['notifications', props];


    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: showNotifications && isLoggedIn,


        queryFn: () => APIClient.api.get(`/user/notifications`, { params: {
                ...props
            }})
    })

};

export const useUserProfile = ( isLoggedIn, userId, props = {})  => {

    const queryKey = ['user', userId, 'profile'];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!isLoggedIn,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/${userId}/profile`, { params: props})
    })

};

export const usePermissionByUser = ( isLoggedIn, userId, props = {})  => {

    const queryKey = ['user', userId, 'permissions'];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!isLoggedIn,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/${userId}/permissions`, { params: props})
    })

};

export const useUserSettings = ( isLoggedIn, type = 'profile', props = {})  => {

    const queryKey = ['settings', type];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!isLoggedIn,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/settings`, { params: {
            type
            }})
    })

};


export const useUserMenuData = (user,  props = {})  => {

    const queryKey = ['menu'];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!user,
        queryFn: () => APIClient.api.get(`/test`, { params: props})
    })


}

export const usePeopleSearch = (userId,   props = {})  => {

    const queryKey = ['search', userId];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!userId,
        queryFn: () => APIClient.api.post(`/user/find`, {})
    })


}

export const useGroupsByUserId = ( isLoggedIn, userId, props = {})  => {

    const queryKey = ['user', userId, 'groups'];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!isLoggedIn,
        retry: 5,
        queryFn: () => APIClient.api.get(`/user/${userId}/groups`, { params: props})
    })

};


