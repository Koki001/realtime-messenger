"use client";
import { useAppSelector } from "@/store";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LiaUserTieSolid } from "react-icons/lia";
import { RiAttachmentLine } from "react-icons/ri";
import supabase from "@/utils/supabase";

const Profile = () => {
  const selector = useAppSelector((state) => state.profile);
  const currentUser = useAppSelector((state) => state.profile.id);

  const uploadFile = async (e: any) => {
    let image = e.target.files[0];
    console.log(e.target);
    const { data, error } = await supabase.storage
      .from("profiles")
      .upload(currentUser + "/" + "avatar", image);
  };

  return (
    <>
      <div className="profileOptions">
        <h2>My Profile</h2>
        <label className="sr-only" htmlFor="fileUpload">upload image</label>
        <input
          onChange={(e) => uploadFile(e)}
          type="file"
          id="fileUpload"
          name="fileUpload"
          accept="image/png, image/jpeg, image/jpg"
        />
      </div>
      <div className="avatar">
        <p className="img"></p>
        <p>
          {selector.first_name} {selector.last_name}
        </p>
        <p>{selector.email}</p>
        <p>status</p>
      </div>
      <div className="profileHeading">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. A, asperiores
          dolorum perspiciatis omnis laboriosam corrupti quod pariatur non,
          debitis placeat optio at beatae, veniam aliquam.
        </p>
      </div>
      <div className="profileAccordion">
        <Accordion
          sx={{
            "& .MuiTypography-root": {
              fontFamily: "Public Sans, sans-serif",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className="accordionAbout">
              <LiaUserTieSolid />
              About
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className="profName">
              <span>Name</span>
              <span>
                {selector.first_name} {selector.last_name}
              </span>
            </Typography>
            <Typography className="profEmail">
              <span>Email</span>
              <span>{selector.email}</span>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          sx={{
            "& .MuiTypography-root": {
              fontFamily: "Public Sans, sans-serif",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className="accordionAbout">
              <RiAttachmentLine />
              Attached Files
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
};

export default Profile;
