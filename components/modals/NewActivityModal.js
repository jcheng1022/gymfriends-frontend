'use client'
import styled from "styled-components";
import {Button, DatePicker, Input, Modal, Select, Spin, Tag} from "antd";
import {Controller, useForm} from "react-hook-form";
import ImageUploader from "@/components/ImageUploader";
import {Gap} from "@/components/core";
import dayjs from "dayjs";
import {useEffect, useMemo, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import APIClient from '../../services/api'
import {useParams, usePathname, useRouter} from 'next/navigation';
import {useCurrentUser} from "@/hooks/user.hook";
import {useActivitySharingOptions} from "@/hooks/activity.hook";

const {TextArea} = Input;

const NewActivityModal = ({open = false, onCancel = () => {}}) => {
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useForm()
    const client = useQueryClient();
    const {data: user} = useCurrentUser()
    const { data: options} = useActivitySharingOptions(!!user)

    const pathname = usePathname();
    const params = useParams();
    const {user: userId, groupId, goalId} = params;
    useEffect(() => {
        if ( goalId && groupId) {
            const defaultDestination = `group=${groupId}&goal=${goalId}`;
            setValue('destination', defaultDestination);
        } else if (groupId) {
            const defaultDestination = `group=${groupId}`;
            setValue('destination', defaultDestination);
        }


    }, [groupId, setValue])

    const [loading, setLoading] = useState(false)

    const [image, setImage] = useState(null);


    const onSubmit =  async (data) => {

        const {date, description} = data;

        if (!date || !description ) return;
        setLoading(true)

        const formData = new FormData();
        formData.set("image", image)
        formData.set('data', JSON.stringify(data))

        await APIClient.api.post('/activity', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(() => {
            setLoading(false)



             if (!!goalId && !!groupId) {

                client.refetchQueries({queryKey: ['group-goal', groupId, goalId]})
            }  else if (pathname.includes('group')){
                const {groupId} = params;

                client.refetchQueries({queryKey: ['group-feed', params?.groupId]})
            } else if (user?.id === userId) {
                // user is viewing their own profile
                client.refetchQueries({queryKey: ['activities', {
                    dateOnly: true,
                        userId
                }]})
                client.refetchQueries({queryKey: ['activities', {
                        userId
                    }]})

            } else if (pathname.includes('feed')) {
                client.refetchQueries({queryKey: ['feed', user?.id]})
            }


            onCancel();
        })


    };

    const handleFileUpload  = (file) => {

        setImage(file);
    };
    const SHARING_OPTIONS = {
        ALL: 'ALL',
        GROUP: 'GROUP',
    }

    const selectOptions = useMemo(() => {
        const base = [
            {
                label: 'General',
                value: 'general',
                options: [
                    {
                        label: 'All',
                        value: SHARING_OPTIONS.ALL
                    }
                ]
            }
        ]

        let personalizedOptions = []
       if (options) {
            personalizedOptions = options?.map(option => {
                base[0].options?.push(   {
                    label: `Group - ${option.name}`,
                    value: `group=${option.groupId}`
                })
               return {
                   label: <span> Group - {option.name}</span>,
                   value: option.groupId,
                   options: option.goals.map(goal => {
                           return {
                               label: goal.name,
                               value: `group=${option.groupId}&goal=${goal.id}`
                           }
                       })
               }
           })
       }

        return  [...base, ...personalizedOptions]
    }, [options])

    return (
        <ModalContainer width={1000} open={open} onCancel={onCancel} footer={[]}>
           <Spin spinning={loading}>

               <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">

                   <Controller
                       defaultValue={SHARING_OPTIONS.ALL}

                       control={control}
                       name='destination'
                       render={({ field }) => (
                           <Select
                               placeholderText='Select date'
                               options={selectOptions}
                               style={{width: '100%'}}
                               onChange={(val) => field.onChange(val)}
                               selected={field.value}
                               {...field}
                           />
                       )}
                   />

                   <Controller
                       defaultValue={dayjs()}

                       control={control}
                       name='date'
                       render={({ field }) => (
                           <DatePicker
                               placeholderText='Select date'

                               onChange={(date) => field.onChange(date)}
                               selected={field.value}
                               {...field}
                           />
                       )}
                   />

                   <Gap gap={24}/>

                   <Controller
                       control={control}
                       name='description'
                       render={({ field }) => (
                           <TextArea  value={field.value}  placeholder={'description'} {...field} />

                       )}
                   />
                   <Gap gap={24}/>

                   <ImageUploader register={register} onFileUpload={handleFileUpload}  />
                   <Gap gap={24}/>


                   <Button onClick={handleSubmit(onSubmit)}> Create</Button>
               </form>
           </Spin>
        </ModalContainer>
    )
}

export default NewActivityModal;

const ModalContainer = styled(Modal)`
  
`
