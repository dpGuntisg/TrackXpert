import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faImagePortrait, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function UserContact({ created_by }) {
    const { t } = useTranslation();

    return (
        <div className="bg-accentBlue p-6 rounded-br-lg rounded-bl-lg w-full hover:bg-gray-700 transition duration-300">

            <h2 className="text-xl font-semibold border-b border-mainRed pb-2">
                {t("contact.title")}
            </h2>
            
            <div className="flex items-center gap-4 mt-4 sm:flex-row flex-col">
                {created_by?.profile_image?.data ? (
                    <img
                        src={created_by.profile_image.data}
                        alt={`${created_by.username}'s Profile`}
                        className="w-16 h-16 rounded-full object-cover sm:mr-4"
                    />
                ) : (
                    <FontAwesomeIcon icon={faImagePortrait} size="3x" className="sm:mr-4 text-gray-300" />
                )}

                <div className="text-sm sm:text-base gap-2">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-mainYellow" />
                        {created_by.username}
                    </h3>
                    {created_by.phonenumber && (
                        <p className="flex items-center gap-2 mt-1">
                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-mainYellow" />
                            {created_by.phonenumber}
                        </p>
                    )}
                    <p className="flex items-center gap-2 mt-1">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-mainYellow" />
                        {created_by.email}
                    </p>
                </div>
            </div>
        </div>
    );
}
