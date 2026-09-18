import random
import math
import uuid
from datetime import datetime, timezone
from simulator.config import VehicleConfig, INTERVAL_SECONDS
from simulator.routes import ROUTES


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class VehicleSimulator:
    def __init__(self, config: VehicleConfig):
        self.config = config
        raw_route = ROUTES[config.route_index]
        self.route, self.stops, self.target_speeds = self.densify_route(raw_route, max_segment_km=0.05)
        
        self.segment_distances = []
        for i in range(len(self.route)-1):
            self.segment_distances.append(haversine_km(self.route[i][0], self.route[i][1], self.route[i+1][0], self.route[i+1][1]))
        if not self.segment_distances:
            self.segment_distances.append(0.0)
            
        self.current_segment_index = random.randint(0, max(0, len(self.route) - 2))
        self.distance_along_segment_km = 0.0
        
        self.soc = random.uniform(40, 95)
        self.speed = 0.0
        self.heading = 0.0
        self.charging = False
        self.battery_temp = random.uniform(25, 35)
        self.seq = 0
        self.direction = 1  # 1 = forward, -1 = reverse along route
        self.stop_timer = 0
        
    @staticmethod
    def densify_route(waypoints, max_segment_km=0.05):
        if len(waypoints) < 2:
            return waypoints, [False]*len(waypoints), [25]*len(waypoints)
            
        new_route = [waypoints[0]]
        is_original = [True]
        target_speeds = []
        
        for i in range(len(waypoints) - 1):
            p1 = waypoints[i]
            p2 = waypoints[i+1]
            dist = haversine_km(p1[0], p1[1], p2[0], p2[1])
            
            speed = random.uniform(40, 60) if dist > 0.5 else random.uniform(15, 35)
            
            if dist > max_segment_km:
                num_segments = math.ceil(dist / max_segment_km)
                for j in range(1, num_segments):
                    frac = j / num_segments
                    lat = p1[0] + (p2[0] - p1[0]) * frac
                    lng = p1[1] + (p2[1] - p1[1]) * frac
                    new_route.append((lat, lng))
                    is_original.append(False)
                    target_speeds.append(speed)
            
            new_route.append(p2)
            is_original.append(True)
            target_speeds.append(speed)
            
        target_speeds.append(target_speeds[-1] if target_speeds else 0)
        
        original_count = 0
        stops = [False] * len(new_route)
        for i, orig in enumerate(is_original):
            if orig:
                original_count += 1
                if original_count % 5 == 0:
                    stops[i] = True
                    
        return new_route, stops, target_speeds

    def tick(self) -> dict:
        """Generate one telemetry payload."""
        self.seq += 1
        
        self._update_battery()
        
        if self.charging:
            self.speed = 0.0
        elif self.stop_timer > 0:
            self.stop_timer -= INTERVAL_SECONDS
            self.speed = self.speed * 0.7  # decelerate smoothly
        else:
            target_speed = self.target_speeds[self.current_segment_index]
            self.speed = self.speed * 0.7 + target_speed * 0.3  # Smooth EMA
            
            distance_to_travel = (self.speed / 3600.0) * INTERVAL_SECONDS
            self._move(distance_to_travel)
            
        lat, lng = self._get_current_pos()
        lat += random.gauss(0, 0.00005)
        lng += random.gauss(0, 0.00005)
        
        return {
            "device_id": self.config.device_code,
            "vehicle_id": self.config.vehicle_code,
            "event_id": str(uuid.uuid4()),
            "observed_at": datetime.now(timezone.utc).isoformat(),
            "location": {
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "accuracy_m": round(random.uniform(3, 15), 1),
            },
            "motion": {
                "speed_kph": round(self.speed, 1),
                "heading_deg": round(self.heading, 1),
            },
            "energy": {
                "soc_pct": round(self.soc, 1),
                "estimated_range_km": round(self.soc * 2.5, 1),
                "charging": self.charging,
            },
            "diagnostics": {
                "dtcs": [],
                "battery_temp_c": round(self.battery_temp, 1),
            },
            "connectivity": {
                "network": "4G",
                "firmware": "0.3.1",
            },
            "seq": self.seq,
        }
    
    def _move(self, distance_km):
        if len(self.route) < 2:
            return
            
        remaining_dist = distance_km
        while remaining_dist > 0:
            seg_dist = self.segment_distances[self.current_segment_index]
            dist_to_end = seg_dist - self.distance_along_segment_km
            
            if remaining_dist < dist_to_end:
                self.distance_along_segment_km += remaining_dist
                remaining_dist = 0
            else:
                remaining_dist -= dist_to_end
                self.current_segment_index += self.direction
                self.distance_along_segment_km = 0.0
                
                if self.current_segment_index >= len(self.route) - 1:
                    self.direction = -1
                    self.current_segment_index = len(self.route) - 2
                elif self.current_segment_index < 0:
                    self.direction = 1
                    self.current_segment_index = 0
                    
                if self.stops[self.current_segment_index]:
                    self.stop_timer = random.uniform(15, 30)
                    break
                    
        self._update_heading()

    def _get_current_pos(self):
        if len(self.route) < 2:
            return self.route[0]
            
        p1 = self.route[self.current_segment_index]
        p2 = self.route[self.current_segment_index + 1] if self.direction == 1 else self.route[self.current_segment_index - 1]
        
        seg_dist = self.segment_distances[self.current_segment_index]
        if seg_dist == 0:
            return p1
            
        frac = self.distance_along_segment_km / seg_dist
        
        if self.direction == -1:
            frac = 1.0 - frac
            
        lat = p1[0] + (self.route[self.current_segment_index + 1][0] - p1[0]) * frac
        lng = p1[1] + (self.route[self.current_segment_index + 1][1] - p1[1]) * frac
        return lat, lng
        
    def _update_heading(self):
        if len(self.route) < 2:
            return
            
        idx = self.current_segment_index
        next_idx = min(idx + self.direction, len(self.route) - 1)
        next_idx = max(next_idx, 0)
        
        if idx != next_idx:
            lat1, lng1 = self.route[idx]
            lat2, lng2 = self.route[next_idx]
            new_heading = (math.degrees(math.atan2(lng2 - lng1, lat2 - lat1)) + 360) % 360
            
            # EMA for heading with 360 wraparound handling
            diff = (new_heading - self.heading + 180) % 360 - 180
            self.heading = (self.heading + diff * 0.7) % 360

    def _update_battery(self):
        if self.charging:
            self.soc = min(100, self.soc + random.uniform(1, 3))
            self.battery_temp = min(42, self.battery_temp + random.uniform(0, 0.5))
            if self.soc >= 95:
                self.charging = False
        else:
            drain = random.uniform(0.1, 0.5)
            self.soc = max(0, self.soc - drain)
            self.battery_temp = max(20, self.battery_temp - random.uniform(0, 0.2))
            if self.soc < 15:
                self.charging = True
