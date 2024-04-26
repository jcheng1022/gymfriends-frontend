'use client';

import styled from "styled-components";
import {Menu} from "antd";
import {useState} from "react";
import {Activity, Mail, Settings, Users} from "react-feather";
import {theme} from "@/styles/themes";
import {FlexBox} from "@/components/core";
import GroupMembersSection from "@/components/groups/dashboard/sections/GroupMembersSection";
import GroupGoalsSection from "@/components/groups/dashboard/sections/GroupGoalsSection";
import GroupNotificationsSection from "@/components/groups/dashboard/sections/GroupNotificationsSection";
import GroupSettingsSection from "@/components/groups/dashboard/sections/GroupSettingsSection";

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}
// const levelKeys = getLevelKeys(items);

const iconProps = {
    width: 18
}
const menuItems = [
    {
        key: 'members',
        icon: <Users {...iconProps} />,
        label: 'Members'
    },
    {
        key: 'goals',
        icon: <Activity {...iconProps}  />,
        label: 'Goals'
    },
    {
        key: 'notifications',
        icon: <Mail {...iconProps}  />,
        label: 'Notifications'
    },
    {
        key: 'settings',
        icon: <Settings {...iconProps}  />,
        label: 'Settings'
    },

]
const MENU_ITEMS = {
    MEMBERS: 'members',
    GOALS: 'goals',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings',
}


const GroupDashboard = () => {

    const [openMenuKey, setOpenMenuKey] = useState([MENU_ITEMS.MEMBERS]);

    let isMobile = window?.matchMedia("(max-width: 600px)")?.matches;

    return (
        <Container isMobile={isMobile} align={'flex-start'} wrap={'no-wrap'}>
            <Menu
                mode={isMobile ? 'horizontal' : 'inline'}
                defaultSelectedKeys={['members']}
                openKeys={openMenuKey}
                onClick={(val) => {
                setOpenMenuKey([val.key])
                }}

                inlineCollapsed={isMobile}

                className={isMobile ? 'mobile-dashboard-menu' :'dashboard-menu'}
                items={menuItems}
            />
            {openMenuKey[0] === MENU_ITEMS.MEMBERS && ( <GroupMembersSection/>) }
            {openMenuKey[0] === MENU_ITEMS.GOALS && ( <GroupGoalsSection/>) }

            {openMenuKey[0] === MENU_ITEMS.NOTIFICATIONS && ( <GroupNotificationsSection/>) }

            {openMenuKey[0] === MENU_ITEMS.SETTINGS && ( <GroupSettingsSection/>) }


        </Container>
    )
}

export default GroupDashboard;

const Container = styled(FlexBox)`

  .mobile-dashboard-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    
    width: 100vw;
    padding: 8px;
    background-color: ${theme.softBlue_1};
    z-index: 999; /* Ensure it's above other content */
  }
 
  
  .dashboard-menu {
    width: 200px;
    //padding: 8px;
    background-color: ${theme.softBlue_1};
    height: 100vh;
  }
   .ant-menu-item {
    border-radius: 0;
    margin: 0px;
    color: white;
    letter-spacing: 1.01px;
    font-weight: 500;

    //padding: 0px;
    max-width: ${props => props.isMobile ? '25%' : '100%'};
  }
  
  .ant-menu-title-content {
    display: ${props => props.isMobile ? 'none': 'block'};
  }
  
  .ant-menu-overflow-item {
    text-align: ${props => props.isMobile ? 'center': 'left'};
    width: 25%;
  }

  .ant-menu-item-selected {
    width: ${props => props.isMobile ? '100%' : '200px'};
    color: black;
  }

  

`