import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "../UI/Modal";
import Header from "../Header.jsx";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeletion, setIsDeletion] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeletion(true);
  }

  function handleStopDelete() {
    setIsDeletion(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <div className="center" id="event-details-content">
        <ErrorBlock
          title="Error in loading event"
          message={
            error.info?.message || "failed to fetch data of a relevant event"
          }
        />
      </div>
    );
  }

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        ;
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ ${data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeletion && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure.?</h2>
          <p>Are you really want to delete!!</p>
          <div class="form-actions">
            {isPendingDeletion && <p>Deletion, Please Wait...</p>}
            {isPendingDeletion && (
              <>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="fail to delete event"
              message={
                deleteError.info?.message ||
                "fail to delete event, please again later"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
