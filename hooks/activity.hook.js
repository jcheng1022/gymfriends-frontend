import {useQuery} from "@tanstack/react-query";
import {defaultQueryProps} from "@/app/providers";
import APIClient from "@/services/api";

export const useActivitiesByUser = (userId,  props = {})  => {

    const queryKey = ['activities', userId, props];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!userId,
        queryFn: () => APIClient.api.get(`/activity`, { params: props})
    })


}

export const useActivityFeed = (userId,  props = {})  => {

    const queryKey = ['feed', userId, props];

    return useQuery({
        queryKey,
        ...defaultQueryProps,
        enabled: !!userId,
        queryFn: () => APIClient.api.get(`/activity/feed`, { params: props})
    })


}
