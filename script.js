// 初始化地图视图
var map = L.map('map').setView([30.615, -96.33], 13);

// 加载底图
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 热力图样式函数
function getStyle(val) {
  let color = '#FFEDA0';
  if (val > 30) color = '#FEB24C';
  if (val > 50) color = '#FD8D3C';
  if (val > 80) color = '#FC4E2A';
  if (val > 100) color = '#E31A1C';
  return {
    fillColor: color,
    weight: 0.4,
    color: 'white',
    fillOpacity: 0.7
  };
}

// 加载六边形图层函数（根据时段字段）
function loadLayer(url, valueKey) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (window.activeLayer) map.removeLayer(window.activeLayer);
      window.activeLayer = L.geoJSON(data, {
        style: f => getStyle(f.properties[valueKey]),
        onEachFeature: function(f, layer) {
          layer.bindPopup(`H3 Index: ${f.properties.h3_index}<br>${valueKey}: ${f.properties[valueKey]}`);
        }
      }).addTo(map);
    });
}

// 默认加载早高峰图层
loadLayer('data/h3_morning.geojson', 'morning_score');

// 创建图层切换下拉菜单
var control = L.control({position: 'topright'});
control.onAdd = function() {
  let div = L.DomUtil.create('div', 'info');
  div.innerHTML = `
    <select id="timeSelector">
      <option value="morning">Morning Peak</option>
      <option value="lunch">Lunch Time</option>
      <option value="evening">Evening Peak</option>
    </select>
  `;
  return div;
};
control.addTo(map);

// 切换时段逻辑
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('timeSelector').addEventListener('change', function(e) {
    const val = e.target.value;
    if (val === 'morning') loadLayer('data/h3_morning.geojson', 'morning_score');
    if (val === 'lunch') loadLayer('data/h3_lunch.geojson', 'lunch_score');
    if (val === 'evening') loadLayer('data/h3_evening.geojson', 'evening_score');
  });
});

// 加载公寓点图层
fetch("data/Apartments.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#FF5733",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.85
        });
      },
      onEachFeature: function (feature, layer) {
        const name = feature.properties.name || "Unnamed apartment";
        layer.bindPopup(`<b>Apartment:</b> ${name}`);
      }
    }).addTo(map);
  });
