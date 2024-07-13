"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:9002");

export default function Home() {
  const [repoURL, setURL] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState();
  const [deployPreviewURL, setDeployPreviewURL] = useState();
  const logContainerRef = useRef<any>();

  const isValidURL = useMemo(() => {
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/;
    return regex.test(repoURL);
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:9000/project", {
        gitURL: repoURL,
        slug: projectId,
      });

      if (data?.data) {
        const { projectSlug, url } = data.data;
        setProjectId(projectSlug);
        setDeployPreviewURL(url);
        socket.emit("subscribe", `logs:${projectSlug}`);
      }
    } catch (error) {
      console.error("Error deploying project:", error);
    } finally {
      setLoading(false);
    }
  }, [repoURL, projectId]);

  const handleSocketIncomingMessage = useCallback((message: any) => {
    const { log } = JSON.parse(message);
    setLogs((prev): any => [...prev, log]);
    logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    socket.on("message", handleSocketIncomingMessage);
    return () => {
      socket.off("message", handleSocketIncomingMessage);
    };
  }, [handleSocketIncomingMessage]);

  return (
    <main className="flex justify-center items-center h-screen">
      <div className="w-96">
        <div className="flex flex-col items-center gap-4 mb-3">
          <svg className="text-5xl" fill="currentColor" viewBox="0 0 24 24">
            {/* GitHub icon */}
            <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.2 3.36 9.63 7.94 11.19.58.1.79-.25.79-.55 0-.28-.01-1.24-.01-2.26-3.23.67-3.91-1.56-3.91-1.56-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.39.97.1-.75.41-1.27.74-1.56-2.43-.28-4.99-1.22-4.99-5.44 0-1.2.43-2.19 1.14-2.97-.11-.28-.49-1.39.11-2.9 0 0 .91-.29 2.97 1.1.86-.24 1.79-.35 2.72-.35.93 0 1.86.12 2.72.35 2.06-1.39 2.97-1.1 2.97-1.1.6 1.51.22 2.62.11 2.9.71.78 1.14 1.77 1.14 2.97 0 4.25-2.57 5.16-5.01 5.44.43.37.81 1.1.81 2.23 0 1.61-.01 2.91-.01 3.3 0 .3.21.66.79.55C20.64 22.13 24 17.7 24 12.5 24 5.87 18.63.5 12 .5z" />
          </svg>
          <input
            className="rounded-lg p-2 w-full bg-neutral-900 text-white focus:outline-none"
            disabled={loading}
            value={repoURL}
            onChange={(e) => setURL(e.target.value)}
            type="url"
            placeholder="GitHub URL"
          />
        </div>
        <button
          onClick={handleClickDeploy}
          disabled={!isValidURL || loading}
          className={`w-full mt-3 p-2 rounded-lg ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-500"
          } text-white`}
        >
          {loading ? "In Progress" : "Deploy"}
        </button>
        {deployPreviewURL && (
          <div className="mt-2 bg-gray-800 py-4 px-2 rounded-lg">
            <p>
              Preview URL:{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400"
                href={deployPreviewURL}
              >
                {deployPreviewURL}
              </a>
            </p>
          </div>
        )}
        {logs.length > 0 && (
          <div className="text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-72 overflow-y-auto">
            <pre className="flex flex-col gap-1">
              {logs.map((log, i) => (
                <code
                  ref={logs.length - 1 === i ? logContainerRef : undefined}
                  key={i}
                >{`> ${log}`}</code>
              ))}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
