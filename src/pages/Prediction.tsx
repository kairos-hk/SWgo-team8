import React, { useEffect, useState } from "react";
import pd from "./Prediction.module.scss";
import components from "../components/components.module.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { Doughnut } from "react-chartjs-2";
import { Chart } from "chart.js/auto";

interface Type {
  setHeader: React.Dispatch<React.SetStateAction<string>>;
}

const Prediction: React.FC<Type> = (props) => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ lat: 36.30317, lng: 128.58519 });
  const [address, setAddress] = useState("");
  const [markers, setMarkers] = useState([]);
  const [overlayContent, setOverlayContent] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);

  const [chartData, setChartData] = useState({
    labels: ["Condition Score"],
    datasets: [
      {
        label: "Condition Score",
        data: [0],
        backgroundColor: ["rgba(75,192,192,0.6)"],
        type: "doughnut", // Set the type to "doughnut" for the dataset
      },
    ],
  });

  useEffect(() => {
    props.setHeader("Main");
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/list")
      .then((res) => {
        const newMarkers = res.data.map((item) => ({
          lat: parseFloat(item.latitude),
          lng: parseFloat(item.longitude),
          conditionScore: item.condition_score,
          conditionType: item.condition_type,
          confidenceScore: item.confidence_score,
        }));
        setMarkers(newMarkers);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function submit(
    e:
      | React.MouseEvent<HTMLInputElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const existingChart = Chart.getChart("condition-chart");
    if (existingChart) {
      existingChart.destroy();
    }

    await axios("http://127.0.0.1:5000/map", {
      method: "POST",
      data: {
        latitude: position.lat.toFixed(5),
        longitude: position.lng.toFixed(5),
      },
    })
      .then((res) => {
        const className = res.data.class_name;
        const conditionScore = res.data.condition_score;
        const conditionType = res.data.condition_type;

        let overlayContent = "";

        if (className === 1) {
          overlayContent = "도로 내 파손 및 손상을 발견하였습니다!\n";
          const emergencyMessage =
          conditionType === "eme" ? "긴급 보수 필요 상태!" : "일반 보수 필요";
        overlayContent += `
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n
          ${
            conditionType === "eme"
              ? emergencyMessage
              : "Normal Repair Required"
          }
          ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n
          ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n
        `;
        }

        if (className === 0) {
          overlayContent = "도로 내 파손 및 손상이 없습니다.!\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n";
        }


        

        setOverlayContent(overlayContent);
        setShowOverlay(true);


        setChartData({
          labels: ["Condition Score"],
          datasets: [
            {
              label: "Condition Score",
              data: [conditionScore],
              backgroundColor: ["rgba(75,192,192,0.6)"],
              type: "doughnut",
            },
          ],
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function AddressToPosition(address: string) {
    axios(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${address}`,
      {
        headers: {
          Authorization: `KakaoAK 40de5b9c824cadd2630051fc0c2ebedd`,
        },
      }
    )
      .then((res) => {
        setPosition({
          lat:
            res.data.documents.length >= 1
              ? parseFloat(Number(res.data.documents[0].address.y).toFixed(5))
              : 36.303172,
          lng:
            res.data.documents.length >= 1
              ? parseFloat(Number(res.data.documents[0].address.x).toFixed(5))
              : 128.5851977,
        });
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  }

  function closeOverlay() {
    setShowOverlay(false);
  }

  return (
    <div className={pd.Body}>
      <div className={pd.map1}>
        <Map
          className={components.Map}
          center={position}
          isPanto={true}
          style={{
            height: "770px",
          }}
          level={5}
          onClick={(_t, e) =>
            setPosition({
              lat: parseFloat(e.latLng.getLat().toFixed(5)),
              lng: parseFloat(e.latLng.getLng().toFixed(5)),
            })
          }
          mapTypeId={kakao.maps.MapTypeId.SKYVIEW} 
        >
          {markers.map((marker, index) => (
            <MapMarker key={index} position={marker} draggable={false} />
          ))}
        </Map>
      </div>

      <div className={pd.rightContainer}>
        <div className={pd.map2}>
          <Map
            className={components.Map}
            center={position}
            isPanto={true}
            style={{
              width: "400px",
              height: "450px",
            }}
            level={5}
            onClick={(_t, e) =>
              setPosition({
                lat: parseFloat(e.latLng.getLat().toFixed(5)),
                lng: parseFloat(e.latLng.getLng().toFixed(5)),
              })
            }
          >
            <MapMarker
              position={position}
              draggable={true}
              opacity={0.9}
              onDragEnd={(e) =>
                setPosition({
                  lat: parseFloat(e.getPosition().getLat().toFixed(5)),
                  lng: parseFloat(e.getPosition().getLng().toFixed(5)),
                })
              }
            />
          </Map>
        </div>

        <div className={pd.bottomContainer}>
          <div className={pd.coordinates}>
            <br></br>
            <input
              disabled
              className={pd.Input}
              placeholder="lat"
              value={`lat: ${position.lat}`}
            />
            <br></br>
            <input
              disabled
              className={pd.Input}
              placeholder="lng"
              value={`lng: ${position.lng}`}
            />
          </div>
          <br></br>
          <div className={pd.addressForm}>
            <input
              className={pd.Input}
              placeholder="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <br></br>
            <input
              type="button"
              className={pd.InputButton}
              value={"Search Address"}
              onClick={() => AddressToPosition(address)}
            />
          </div>

          <form onSubmit={submit} className={pd.analysisForm}>
            <input
              type="submit"
              className={pd.InputButton}
              value={"Analyzing Road Condition"}
            />
          </form>
        </div>
      </div>
      {}
      {showOverlay && (
        <div className={pd.overlay}>
          <div className={pd.overlayContent}>
            <span className={pd.closeOverlay} onClick={closeOverlay}>
              &times;
            </span>

            <div className={pd.chartContainer}>
              {}
              <Doughnut id="condition-chart" data={chartData} />
            </div>

            <div className={pd.textContainer}>{overlayContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;
