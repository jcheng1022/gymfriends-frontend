'use client'

import styled from 'styled-components'
import {FlexBox} from "@/components/core";
import {theme} from "@/styles/themes";

const UserActivityStats = () => {

    // const { data: user } = useCurrentUser();

    // const {data: stats } = useActivitiesStatsByUser( user?.id,)
    // const graphData = useMemo(() => {
    //     return activities?.map(o => o.date)
    // }, [activities])

    return (
        <Container justify={'center'} align={'flex-start'}>
            Coming soon ( stats)
        </Container>
    )
}

export default UserActivityStats;

const Container = styled(FlexBox)`
  height: 300px;
  min-width: 100px;
  max-width: 50%;
  padding: 24px;
  border-radius: 12px;
  background-color: ${theme.WHITE};
`
