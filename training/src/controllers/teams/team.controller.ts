import { Body, ListRepresenter, Representer } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch, Post, Req } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { TeamBody } from "../../contracts/bodies/team.body";
import { TeamView } from "../../contracts/views/team.view";
import { createTeam } from "./handlers/createTeam.handler";
import { deleteTeam } from "./handlers/deleteTeam.handler";
import { getTeam } from "./handlers/getTeam.handler";
import { getTeams } from "./handlers/getTeams.handler";
import { updateTeam } from "./handlers/updateTeam.handler";

@JsonController('/teams')
export class TeamController {
  @Post()
  @Authorized()
  @OpenAPI({ summary: 'Create team for current user' })
  @Representer(TeamView)
  async createTeam(@Body() body: TeamBody, @Req() { token: { userId } }: any) {
    return createTeam(body, userId)
  }

  @Get()
  @Authorized()
  @OpenAPI({ summary: 'Get teams list of current user' })
  @ListRepresenter(TeamView)
  async getTeams(@Req() { token: { userId } }: any) {
    return getTeams(userId)
  }

  @Get('/:id')
  @Authorized()
  @OpenAPI({ summary: 'Get team' })
  @Representer(TeamView)
  async getTeam(@Param("id") id: string) {
    return getTeam(id)
  }

  @Patch('/:id')
  @Authorized()
  @OpenAPI({ summary: 'Update team' })
  @Representer(TeamView)
  async updateTeam(@Param("id") id: string, @Body({}, { skipMissingProperties: true }) body: TeamBody) {
    return updateTeam(id, body);
  }

  @Delete('/:id')
  @Authorized()
  @Representer(null, 204)
  async deleteTeam(@Param("id") id: string) {
    return deleteTeam(id);
  }
}