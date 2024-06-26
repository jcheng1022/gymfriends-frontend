'use client'
import styled from "styled-components";
import {Button, DatePicker, Input, Modal, notification, Select, Slider, Spin} from "antd";
import {Controller, useForm} from "react-hook-form";
import ImageUploader from "@/components/ImageUploader";
import {FlexBox, Gap} from "@/components/core";
import dayjs from "dayjs";
import {useEffect, useMemo, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import APIClient from '../../../services/api'
import {useParams, usePathname, useRouter} from 'next/navigation';
import {useCurrentUser} from "@/hooks/user.hook";
import {useActivitySharingOptions} from "@/hooks/activity.hook";
import {theme} from "@/styles/themes";
import {X} from "react-feather";
import Cropper from "react-easy-crop";
import {getCroppedImg} from "@/utils/canvasUtils";
import ActivityItem from "@/components/feed/ActivityItem";
import {extractGroupAndGoalId} from "@/utils";
import {COLLECTION_TYPES, RESOURCE_TYPES} from "@/constants";

const {TextArea} = Input;


function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result), false)
        reader.readAsDataURL(file)
    })
}

const MODAL_STEPS = {
    INITIAL: 'INITIAL',
    IMAGE_ADJUSTOR: 'IMAGE_ADJUSTOR',
    FINALIZE_UPLOAD: 'FINALIZE_UPLOAD',
    PUBLISHED: 'PUBLISHED'
}
const STEP_ORDER = [MODAL_STEPS.INITIAL, MODAL_STEPS.IMAGE_ADJUSTOR, MODAL_STEPS.FINALIZE_UPLOAD, MODAL_STEPS.PUBLISHED]
const InitialCreateActivityModal = ({open = false, onCancel = () => {}}) => {
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm()
    const client = useQueryClient();
    const {data: user} = useCurrentUser()
    const { data: options} = useActivitySharingOptions(!!user)
    console.log(options, 'options2')
    const [uploadStep, setUploadStep] = useState(MODAL_STEPS.INITIAL)
    const router = useRouter();

    const pathname = usePathname();
    const params = useParams();
    const {user: userId, groupId, goalId} = params;


    // image ajdustor step
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [croppedImage, setCroppedImage] = useState(null)



    useEffect(() => {
        if ( goalId && groupId) {
            const defaultDestination = `collection=${groupId}&goal=${goalId}`;
            setValue('destination', defaultDestination);
        } else if (groupId) {
            const defaultDestination = `collection=${groupId}`;
            setValue('destination', defaultDestination);
        }


    }, [groupId, setValue])

    const [loading, setLoading] = useState(false)

    const [image, setImage] = useState(null);


    const onSubmit =  async (data) => {

        // const {date, description} = data;
        const { date, description, destination } = getValues()

        if (!description ) {
            notification.error({
                message: 'Please fill in the required fields',
                description: 'Description are required',
                duration: 5
            })
            return;
        };
        setLoading(true)

        const formData = new FormData();

        formData.append("image", croppedImage)
        formData.set("image", croppedImage)
        formData.set('data', JSON.stringify({
            date : date ?? dayjs().format('YYYY-MM-DD'),
            description,
            destination,
            mediaUrl: croppedImage
        }))

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


             // setUploadStep(prev => prev + 1)
            setUploadStep(MODAL_STEPS.PUBLISHED)
            // onCancel();
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
                // base[0].options?.push(   {
                //     label: `Group - ${option.name}`,
                //     value: `collection=${option.groupId}`
                // })

                if (option.type === COLLECTION_TYPES.USER) {
                    return {
                        label: <span> Personal Collections</span>,
                        value: option.groupId,
                        options: [
                            {
                                label: option.name,
                                value: `collection=${option.groupId}`,
                                children: option.goals?.map(goal => {
                                    return {
                                        label: goal.name,
                                        value: `collection=${option.groupId}&goal=${goal.id}`
                                    }
                                })
                            }
                        ]
                    }

                }

                const groupOptions = [{

                            label: `Share to whole group`,
                            value: `collection=${option.groupId}`

                }]
                if (option.goals) {
                    option.goals?.forEach(goal => {
                        groupOptions.push({
                            label: goal.name,
                            value: `collection=${option.groupId}&goal=${goal.id}`
                        })
                    })

                }
               return {
                   label: <span> Groups- {option.name}</span>,
                   // value: option.groupId,
                   options: groupOptions
               }
           })
       }

        return  [...base, ...personalizedOptions]
    }, [options])

    const initialStep = () => {
        return (
            <>
                <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>

                <div className={'input-label'}> Sharing location</div>
                <Controller
                    defaultValue={SHARING_OPTIONS.ALL}

                    control={control}
                    name='destination'
                    render={({ field }) => (
                        <Select
                            placeholderText='Select date'
                            options={selectOptions}
                            style={{maxWidth: '100%', minWidth: '100%'}}
                            onChange={(val) => field.onChange(val)}
                            selected={field.value}
                            {...field}
                        />
                    )}
                />
                    <Gap gap={12}/>
                <div className={'input-label'}> Activity date</div>

                <Controller
                    // defaultValue={dayjs().format('YYYY-MM-DD')} // Set defaultValue to today's date

                    control={control}
                    name='date'
                    render={({ field }) => (
                        <DatePicker
                            placeholderText='Select date'
                            defaultValue={dayjs()}
                            onChange={(date) => field.onChange(date)}
                            selected={field.value}
                            {...field}
                        />
                    )}
                />

                <Gap gap={12}/>
                <div className={'input-label'}> Description (optional)</div>

                <Controller
                    control={control}
                    name='description'
                    render={({ field }) => (
                        <TextArea  value={field.value}  placeholder={'I studied for 2 hours today'} {...field} />

                    )}
                />
                <Gap gap={12}/>
                <div className={'input-label'}> Image (optional)</div>

                <ImageUploader image={image} setImage={setImage} register={register} onFileUpload={handleFileUpload}  />
                <Gap gap={12}/>


               <FlexBox justify={'flex-start'} className={'action-container-create-activity'}>
                   { (!image) ? (
                       <Button className={'create-activity-btn'} onClick={handleSubmit(onSubmit)}>
                           Create
                       </Button>
                   ) :
                       (
                           <Button className={'next-step-btn'}
                                   onClick={() => setUploadStep(MODAL_STEPS.IMAGE_ADJUSTOR)}
                               // onClick={handleSubmit(onSubmit)}
                           > Next</Button>
                       )}

               </FlexBox>
                </form>
            </>
        )
    }

    const imageAdjustorStep = () => {

        const onCropComplete = (croppedArea, croppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels)
        }

        const submitCroppedImage = async () => {
            try {
                const croppedImage = await getCroppedImg(
                    image,
                    croppedAreaPixels,
                    rotation
                )
                setCroppedImage(croppedImage)
                setUploadStep(MODAL_STEPS.FINALIZE_UPLOAD)
            } catch (e) {
                notification.error({
                    message: 'Error cropping image',
                    description: 'There was an error cropping the image',
                    duration: 5
                })
                console.error(e)
            }
        }


        return (
            <AdjustorContainer>
                <div className={'cropper-container'} >
                    <Cropper
                        image={image}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className={'controls-container'}>
                    <div className={'slider-container'}>
                        <div
                            className={'slider-label'}
                        >
                            Zoom
                        </div>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            className={'zoom-slider'}
                            onChange={(zoom) => setZoom(zoom)}
                        />
                    </div>
                    <div className={'slider-container'}>
                        <div
                            className={'slider-label'}
                        >
                            Rotation
                        </div>
                        <Slider
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            className={'zoom-slider'}
                            onChange={(val) => setRotation(val)}
                        />
                    </div>

                    <FlexBox justify={'center'} gap={12} className={'action-container-create-activity'}>
                        <Button className={'go-back-btn'} onClick={() => setUploadStep(prev => prev - 1)}>
                            Back
                        </Button>
                        <Button
                            onClick={submitCroppedImage}
                            className={'next-step-btn'}
                            // variant="contained"
                            color="primary"
                            // classes={{ root: classes.cropButton }}
                        >
                            Next
                        </Button>

                    </FlexBox>

                </div>
                {/*<ImgDialog img={croppedImage} onClose={onClose} />*/}
            </AdjustorContainer>
        )
    }

    const finalizeUploadStep = () => {
        const {description} = getValues()

        const activityDraft = {
            id: 1, // idk

            mediaUrl: croppedImage,
            description,

        }
        return (
            <FinalizeContainer direction={'column'} align={'center'}>
                <div className={'preview-title'}> Preview </div>
                {/*<div className={'preview-description'}>  </div>*/}

                <FlexBox justify={'center'} className={'dummy-activity-container'}>
                    <ActivityItem type={'image'} activity={activityDraft} isPreview={true} />

                </FlexBox>

                <Gap gap={24}/>

                <FlexBox justify={'center'} gap={12} className={'action-container-create-activity'}>

                    <Button className={'go-back-btn'} onClick={() => setUploadStep(prev => prev - 1)}>
                        Back
                    </Button>
                    <Button className={'create-activity-btn'} onClick={handleSubmit(onSubmit)}>
                        Create
                    </Button>
                </FlexBox>
            </FinalizeContainer>
        )
    }

    const PublishedStep = () => {
        const {description, destination} = getValues()
        const {collectionId, goalId, type} = extractGroupAndGoalId(destination)

        const handleNavigation = () => {




            if (type === RESOURCE_TYPES.ALL) {
                router.push(`/feed`)
            } else if (type === RESOURCE_TYPES.COLLECTION) {
                router.push(`/group/${collectionId}/?tab=feed`)
            } else if (type === RESOURCE_TYPES.GROUP_GOAL) {
                router.push(`/group/${collectionId}/goal/${goalId}`)
            }
            onCancel();
        }
        const activityDraft = {
            id: 1, // idk

            mediaUrl: croppedImage ?? null,
            description,

        }
        let content = {
            title: '',
            btnContent: ''
        }

        if (type === RESOURCE_TYPES.ALL ) {
            content.title = "Your activity has been shared to the feed"
            content.btnContent = 'View Feed'
        } else if (type === RESOURCE_TYPES.COLLECTION) {
            content.title = "Your activity has been shared to the group"
            content.btnContent = 'View Group'
        } else if (type === RESOURCE_TYPES.GROUP_GOAL) {
            content.title = "Your activity has been shared to the goal feed"
            content.btnContent = 'View Group Goal'
        }
        return (
            <PublishedStepContainer align={'center'} justify={'center'} direction={'column'}>

                <div className={'published-title'}> 🎉 Wooo! 🎉</div>
                <div className={'published-description'}> {content.title}</div>

                <ActivityItem type={'image'} activity={activityDraft} isPreview={true} />

                <Gap gap={24}/>

                <Button className={'navigate-to-activity-btn'} onClick={handleNavigation}>
                    {content.btnContent}
                </Button>


            </PublishedStepContainer>
        )
    }

    return (
        <ModalContainer centered closeIcon={<X/>} width={1000} open={open} onCancel={onCancel} footer={[]}>
           <Spin spinning={loading}>

               {uploadStep === MODAL_STEPS.INITIAL && initialStep()}
               {uploadStep === MODAL_STEPS.IMAGE_ADJUSTOR && imageAdjustorStep()}
                {uploadStep === MODAL_STEPS.FINALIZE_UPLOAD && finalizeUploadStep()}
                {uploadStep === MODAL_STEPS.PUBLISHED && PublishedStep()}

           </Spin>
        </ModalContainer>
    )
}

export default InitialCreateActivityModal;

const ModalContainer = styled(Modal)`
  display: flex;
  align-items: center;
   .ant-modal-content {
    height: 100%;

    max-width: 100%;

    margin: 0;
    top: 0;
     background-color: ${theme.jetGrey};
color: white;

   }
  .ant-modal-body {
    
    //height: calc(100vh - 110px);
    
  width: 100%;
    //height: 600px;
  }
  
  
  .ant-modal-content {
    padding-top: 36px;
  }
  .input-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: ${theme.primaryBlue};
  }
  
  .next-step-btn {
    background-color: #0f3273;
    color: white;
    border-radius: 12px;
    width: 150px;
    height: 50px;
    font-weight: 600;
  }
  .create-activity-btn{
    background-color: ${theme.primaryBlue};
    color: white;
    border-radius: 12px;

    height: 50px;
    width: 150px;
    font-weight: 600;
    font-size: 16px;
  }

  .action-container-create-activity {
    margin: 48px 0px;
    
    .go-back-btn {
        background-color: ${theme.steel10};
        color: black;
        border-radius: 12px;
        height: 50px;
        width: 150px;
        font-weight: 600;
    }
  }
`

const AdjustorContainer = styled.div`

  
  .cropper-container {
    position: relative;
    height: 300px;
    width: 100%;
  }
  //position: relative;
  //width: 100%;
  //height: 100%;
  //height: 200px;
  //background: #333;
`


const FinalizeContainer = styled(FlexBox)`
    
    .preview-title {
        font-size: 36px;
      letter-spacing: 1.2px;
        font-weight: 600;
        margin-bottom: 12px;
      text-align: center;
    }
  
  .dummy-activity-container {
    padding: 24px 0px;
    background-color: #333;
    width: 100%;
    height: 500px;
  }


  
  .go-back-btn {
    
  }


`

const PublishedStepContainer = styled(FlexBox)`
  .published-title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .published-description {
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 24px;
  }
  
  .navigate-to-activity-btn {
    background-color: ${theme.primaryBlue};
    color: white;
    font-size: 16px;
    border-radius: 12px;
    height: 60px;
    width: 200px;
    font-weight: 600;
  }
`
