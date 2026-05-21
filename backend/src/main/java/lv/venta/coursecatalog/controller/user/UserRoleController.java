package lv.venta.coursecatalog.controller.user;

import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.service.user.UserRoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Lomu saraksta REST API. Lomas ir fiksētas (RoleKey enum) un tās caur
 * šo API nedrīkst pievienot, mainīt vai dzēst. Pieejams tikai GET, lai
 * frontend forma varētu parādīt lomu dropdown lietotāju izveidē.
 */
@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {

    private final UserRoleService service;

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserRole> getAll() {
        return service.getAll();
    }
}
