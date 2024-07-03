import { useState } from "react";
import { UserInfo } from "../types";
import { useChromeLocalStorage } from "./useChromeLocalStorage";
import { StorageKeys } from "../constants";

export const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState<UserInfo>();
    const { } = useChromeLocalStorage({
        key: StorageKeys.userInfo, getter: (userInfoVal: UserInfo | undefined) => {
            setUserInfo(userInfoVal);
        }
    });
    return [userInfo, setUserInfo];
}